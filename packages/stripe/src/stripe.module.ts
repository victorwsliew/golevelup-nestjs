import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { flatten, groupBy } from 'lodash';
import Stripe from 'stripe';
import {
  STRIPE_CLIENT_TOKEN,
  STRIPE_MODULE_CONFIG_TOKEN,
  STRIPE_WEBHOOK_HANDLER,
  STRIPE_WEBHOOK_SERVICE,
} from './stripe.constants';
import { InjectStripeModuleConfig } from './stripe.decorators';
import {
  StripeModuleConfig,
  StripeMultiCountryModuleConfig,
} from './stripe.interfaces';
import { StripePayloadService } from './stripe.payload.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeWebhookService } from './stripe.webhook.service';

@Module({
  controllers: [StripeWebhookController],
})
export class StripeModule
  extends createConfigurableDynamicRootModule<
    StripeModule,
    StripeMultiCountryModuleConfig
  >(STRIPE_MODULE_CONFIG_TOKEN, {
    imports: [DiscoveryModule],
    providers: [
      {
        provide: Symbol('CONTROLLER_HACK'),
        useFactory: (config: StripeMultiCountryModuleConfig) => {
          const controllerPrefix = 'stripe';

          Reflect.defineMetadata(
            PATH_METADATA,
            controllerPrefix,
            StripeWebhookController
          );

          const firstConfig = config[Object.keys(config)[0]];
          firstConfig.webhookConfig?.decorators?.forEach((deco) => {
            deco(StripeWebhookController);
          });
        },
        inject: [STRIPE_MODULE_CONFIG_TOKEN],
      },
      {
        provide: STRIPE_CLIENT_TOKEN,
        useFactory: (
          config: StripeMultiCountryModuleConfig
        ): {
          [countryCode: string]: Stripe;
        } => {
          return Object.keys(config).reduce((acc, countryCode) => {
            const { apiKey, webhookConfig, ...options } = config[countryCode];
            acc[countryCode] = new Stripe(apiKey, {
              typescript: true,
              apiVersion: '2022-11-15',
              ...options,
            });
            return acc;
          }, {});
        },
        inject: [STRIPE_MODULE_CONFIG_TOKEN],
      },
      StripeWebhookService,
      StripePayloadService,
    ],
    exports: [STRIPE_MODULE_CONFIG_TOKEN, STRIPE_CLIENT_TOKEN],
  })
  implements OnModuleInit
{
  private readonly logger = new Logger(StripeModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    @InjectStripeModuleConfig()
    private readonly stripeModuleConfig: StripeMultiCountryModuleConfig
  ) {
    super();
  }

  public async onModuleInit() {
    // If they didn't provide a webhook config secret there's no reason
    // to even attempt discovery
    if (Object.keys(this.stripeModuleConfig).length === 0) {
      return;
    }

    const noOneSecretProvided =
      Object.keys(this.stripeModuleConfig).length > 0 &&
      Object.keys(this.stripeModuleConfig).every((countryCode) => {
        const countryConfig = this.stripeModuleConfig[countryCode];
        return (
          !countryConfig.webhookConfig?.stripeSecrets.account &&
          !countryConfig.webhookConfig?.stripeSecrets.connect
        );
      });

    if (noOneSecretProvided) {
      const errorMessage =
        'missing stripe webhook secret. module is improperly configured and will be unable to process incoming webhooks from Stripe';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.logger.log('Initializing Stripe Module for webhooks');

    const [stripeWebhookService] = (
      (await this.discover.providersWithMetaAtKey<boolean>(
        STRIPE_WEBHOOK_SERVICE
      )) || []
    ).map((x) => x.discoveredClass.instance);

    if (
      !stripeWebhookService ||
      !(stripeWebhookService instanceof StripeWebhookService)
    ) {
      throw new Error('Could not find instance of Stripe Webhook Service');
    }

    const eventHandlerMeta =
      await this.discover.providerMethodsWithMetaAtKey<string>(
        STRIPE_WEBHOOK_HANDLER
      );

    const grouped = groupBy(
      eventHandlerMeta,
      (x) => x.discoveredMethod.parentClass.name
    );

    const webhookHandlers = flatten(
      Object.keys(grouped).map((x) => {
        this.logger.log(`Registering Stripe webhook handlers from ${x}`);

        return grouped[x].map(({ discoveredMethod, meta: eventType }) => ({
          key: eventType,
          handler: this.externalContextCreator.create(
            discoveredMethod.parentClass.instance,
            discoveredMethod.handler,
            discoveredMethod.methodName,
            undefined, // metadataKey
            undefined, // paramsFactory
            undefined, // contextId
            undefined, // inquirerId
            {
              interceptors: false,
              guards: false,
              filters: false,
            }, // options
            'stripe_webhook' // contextType
          ),
        }));
      })
    );

    const handleWebhook = async (webhookEvent: { type: string }) => {
      const { type } = webhookEvent;
      const handlers = webhookHandlers.filter((x) => x.key === type);
      const { loggingConfiguration } =
        this.stripeModuleConfig[Object.keys(this.stripeModuleConfig)[0]]
          .webhookConfig || {};

      if (handlers.length) {
        if (loggingConfiguration?.logMatchingEventHandlers) {
          this.logger.log(
            `Received webhook event for ${type}. Forwarding to ${handlers.length} event handlers`
          );
        }
        await Promise.all(handlers.map((x) => x.handler(webhookEvent)));
      }
    };

    stripeWebhookService.handleWebhook = handleWebhook;
  }
}

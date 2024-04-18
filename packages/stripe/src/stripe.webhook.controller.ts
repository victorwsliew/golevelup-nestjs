import { Controller, Headers, Param, Post, Request } from '@nestjs/common';
import { InjectStripeModuleConfig } from './stripe.decorators';
import { StripeMultiCountryModuleConfig } from './stripe.interfaces';
import { StripePayloadService } from './stripe.payload.service';
import { StripeWebhookService } from './stripe.webhook.service';

@Controller('/stripe')
export class StripeWebhookController {
  private readonly requestBodyProperty: {
    [countryCode: string]: string;
  };

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeMultiCountryModuleConfig,
    private readonly stripePayloadService: StripePayloadService,
    private readonly stripeWebhookService: StripeWebhookService
  ) {
    this.requestBodyProperty = {
      ...Object.keys(config).reduce((acc, countryCode) => {
        acc[countryCode] =
          config[countryCode].webhookConfig?.requestBodyProperty || 'body';
        return acc;
      }, {}),
    };
  }

  @Post(':countryCode/webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Request() request,
    @Param('countryCode') countryCode: string
  ) {
    if (!sig) {
      throw new Error('Missing stripe-signature header');
    }
    const rawBody = request[this.requestBodyProperty[countryCode]];

    const event = this.stripePayloadService.tryHydratePayload(
      sig,
      rawBody,
      countryCode
    );

    await this.stripeWebhookService.handleWebhook(event);
  }
}

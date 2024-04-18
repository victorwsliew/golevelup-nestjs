import { Injectable } from '@nestjs/common';
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';
import {
  InjectStripeClient,
  InjectStripeModuleConfig,
} from './stripe.decorators';
import { StripeMultiCountryModuleConfig } from './stripe.interfaces';

@Injectable()
export class StripePayloadService {
  private readonly stripeWebhookSecret: {
    [countryCode: string]: string;
  };
  private readonly stripeConnectWebhookSecret: {
    [countryCode: string]: string;
  };

  constructor(
    @InjectStripeModuleConfig()
    private readonly config: StripeMultiCountryModuleConfig,
    @InjectStripeClient()
    private readonly stripeClients: {
      [countryCode: string]: Stripe;
    }
  ) {
    this.stripeWebhookSecret = {
      ...Object.keys(config).reduce((acc, countryCode) => {
        acc[countryCode] =
          this.config[countryCode].webhookConfig?.stripeSecrets.account || '';
        return acc;
      }, {}),
    };
    this.stripeConnectWebhookSecret = {
      ...Object.keys(config).reduce((acc, countryCode) => {
        acc[countryCode] =
          this.config[countryCode].webhookConfig?.stripeSecrets.connect || '';
        return acc;
      }, {}),
    };
  }
  tryHydratePayload(
    signature: string,
    payload: Buffer,
    countryCode: string
  ): { type: string } {
    const decodedPayload = JSON.parse(
      Buffer.isBuffer(payload) ? payload.toString('utf8') : payload
    );

    return this.stripeClients[countryCode].webhooks.constructEvent(
      payload,
      signature,
      decodedPayload.account
        ? this.stripeConnectWebhookSecret[countryCode]
        : this.stripeWebhookSecret[countryCode]
    );
  }
}

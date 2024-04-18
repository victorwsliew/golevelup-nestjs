/// <reference types="node" />
import { Buffer } from 'node:buffer';
import Stripe from 'stripe';
import { StripeMultiCountryModuleConfig } from './stripe.interfaces';
export declare class StripePayloadService {
  private readonly config;
  private readonly stripeClients;
  private readonly stripeWebhookSecret;
  private readonly stripeConnectWebhookSecret;
  constructor(
    config: StripeMultiCountryModuleConfig,
    stripeClients: {
      [countryCode: string]: Stripe;
    }
  );
  tryHydratePayload(
    signature: string,
    payload: Buffer,
    countryCode: string
  ): {
    type: string;
  };
}
//# sourceMappingURL=stripe.payload.service.d.ts.map

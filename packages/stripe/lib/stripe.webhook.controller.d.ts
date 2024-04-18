import { StripeMultiCountryModuleConfig } from './stripe.interfaces';
import { StripePayloadService } from './stripe.payload.service';
import { StripeWebhookService } from './stripe.webhook.service';
export declare class StripeWebhookController {
  private readonly config;
  private readonly stripePayloadService;
  private readonly stripeWebhookService;
  private readonly requestBodyProperty;
  constructor(
    config: StripeMultiCountryModuleConfig,
    stripePayloadService: StripePayloadService,
    stripeWebhookService: StripeWebhookService
  );
  handleWebhook(sig: string, request: any, countryCode: string): Promise<void>;
}
//# sourceMappingURL=stripe.webhook.controller.d.ts.map

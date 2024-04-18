import Stripe from 'stripe';
import { STRIPE_WEBHOOK_HANDLER } from './stripe.constants';
/**
 * Injects the Stripe Module config
 */
export declare const InjectStripeModuleConfig: () => ParameterDecorator;
/**
 * Injects the Stripe Client instance
 */
export declare const InjectStripeClient: () => ParameterDecorator;
/**
 * Binds the decorated service method as a handler for incoming Stripe Webhook events.
 * Events will be automatically routed here based on their event type property
 * @param config The configuration for this handler
 */
export declare const StripeWebhookHandler: (
  eventType: Stripe.WebhookEndpointCreateParams.EnabledEvent
) => import('@nestjs/common').CustomDecorator<typeof STRIPE_WEBHOOK_HANDLER>;
//# sourceMappingURL=stripe.decorators.d.ts.map

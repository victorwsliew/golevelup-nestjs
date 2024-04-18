"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookHandler = exports.InjectStripeClient = exports.InjectStripeModuleConfig = void 0;
const nestjs_common_1 = require("@golevelup/nestjs-common");
const common_1 = require("@nestjs/common");
const stripe_constants_1 = require("./stripe.constants");
/**
 * Injects the Stripe Module config
 */
exports.InjectStripeModuleConfig = (0, nestjs_common_1.makeInjectableDecorator)(stripe_constants_1.STRIPE_MODULE_CONFIG_TOKEN);
/**
 * Injects the Stripe Client instance
 */
exports.InjectStripeClient = (0, nestjs_common_1.makeInjectableDecorator)(stripe_constants_1.STRIPE_CLIENT_TOKEN);
/**
 * Binds the decorated service method as a handler for incoming Stripe Webhook events.
 * Events will be automatically routed here based on their event type property
 * @param config The configuration for this handler
 */
const StripeWebhookHandler = (eventType) => (0, common_1.SetMetadata)(stripe_constants_1.STRIPE_WEBHOOK_HANDLER, eventType);
exports.StripeWebhookHandler = StripeWebhookHandler;
//# sourceMappingURL=stripe.decorators.js.map
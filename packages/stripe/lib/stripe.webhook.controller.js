"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const stripe_decorators_1 = require("./stripe.decorators");
const stripe_payload_service_1 = require("./stripe.payload.service");
const stripe_webhook_service_1 = require("./stripe.webhook.service");
let StripeWebhookController = class StripeWebhookController {
    constructor(config, stripePayloadService, stripeWebhookService) {
        this.config = config;
        this.stripePayloadService = stripePayloadService;
        this.stripeWebhookService = stripeWebhookService;
        this.requestBodyProperty = Object.assign({}, Object.keys(config).reduce((acc, countryCode) => {
            var _a;
            acc[countryCode] = ((_a = config[countryCode].webhookConfig) === null || _a === void 0 ? void 0 : _a.requestBodyProperty) || 'body';
            return acc;
        }, {}));
    }
    async handleWebhook(sig, request, countryCode) {
        if (!sig) {
            throw new Error('Missing stripe-signature header');
        }
        const rawBody = request[this.requestBodyProperty[countryCode]];
        const event = this.stripePayloadService.tryHydratePayload(sig, rawBody, countryCode);
        await this.stripeWebhookService.handleWebhook(event);
    }
};
__decorate([
    (0, common_1.Post)(':countryCode/webhook'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleWebhook", null);
StripeWebhookController = __decorate([
    (0, common_1.Controller)('/stripe'),
    __param(0, (0, stripe_decorators_1.InjectStripeModuleConfig)()),
    __metadata("design:paramtypes", [Object, stripe_payload_service_1.StripePayloadService,
        stripe_webhook_service_1.StripeWebhookService])
], StripeWebhookController);
exports.StripeWebhookController = StripeWebhookController;
//# sourceMappingURL=stripe.webhook.controller.js.map
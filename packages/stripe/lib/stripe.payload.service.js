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
exports.StripePayloadService = void 0;
const common_1 = require("@nestjs/common");
const node_buffer_1 = require("node:buffer");
const stripe_decorators_1 = require("./stripe.decorators");
let StripePayloadService = class StripePayloadService {
    constructor(config, stripeClients) {
        this.config = config;
        this.stripeClients = stripeClients;
        this.stripeWebhookSecret = Object.assign({}, Object.keys(config).reduce((acc, countryCode) => {
            var _a;
            acc[countryCode] =
                ((_a = this.config[countryCode].webhookConfig) === null || _a === void 0 ? void 0 : _a.stripeSecrets.account) || '';
            return acc;
        }, {}));
        this.stripeConnectWebhookSecret = Object.assign({}, Object.keys(config).reduce((acc, countryCode) => {
            var _a;
            acc[countryCode] =
                ((_a = this.config[countryCode].webhookConfig) === null || _a === void 0 ? void 0 : _a.stripeSecrets.connect) || '';
            return acc;
        }, {}));
    }
    tryHydratePayload(signature, payload, countryCode) {
        const decodedPayload = JSON.parse(node_buffer_1.Buffer.isBuffer(payload) ? payload.toString('utf8') : payload);
        return this.stripeClients[countryCode].webhooks.constructEvent(payload, signature, decodedPayload.account
            ? this.stripeConnectWebhookSecret[countryCode]
            : this.stripeWebhookSecret[countryCode]);
    }
};
StripePayloadService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, stripe_decorators_1.InjectStripeModuleConfig)()),
    __param(1, (0, stripe_decorators_1.InjectStripeClient)()),
    __metadata("design:paramtypes", [Object, Object])
], StripePayloadService);
exports.StripePayloadService = StripePayloadService;
//# sourceMappingURL=stripe.payload.service.js.map
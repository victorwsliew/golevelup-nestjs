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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var StripeModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeModule = void 0;
const nestjs_discovery_1 = require("@golevelup/nestjs-discovery");
const nestjs_modules_1 = require("@golevelup/nestjs-modules");
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const external_context_creator_1 = require("@nestjs/core/helpers/external-context-creator");
const lodash_1 = require("lodash");
const stripe_1 = require("stripe");
const stripe_constants_1 = require("./stripe.constants");
const stripe_decorators_1 = require("./stripe.decorators");
const stripe_payload_service_1 = require("./stripe.payload.service");
const stripe_webhook_controller_1 = require("./stripe.webhook.controller");
const stripe_webhook_service_1 = require("./stripe.webhook.service");
let StripeModule = StripeModule_1 = class StripeModule extends (0, nestjs_modules_1.createConfigurableDynamicRootModule)(stripe_constants_1.STRIPE_MODULE_CONFIG_TOKEN, {
    imports: [nestjs_discovery_1.DiscoveryModule],
    providers: [
        {
            provide: Symbol('CONTROLLER_HACK'),
            useFactory: (config) => {
                var _a, _b;
                const controllerPrefix = 'stripe';
                Reflect.defineMetadata(constants_1.PATH_METADATA, controllerPrefix, stripe_webhook_controller_1.StripeWebhookController);
                const firstConfig = config[Object.keys(config)[0]];
                (_b = (_a = firstConfig.webhookConfig) === null || _a === void 0 ? void 0 : _a.decorators) === null || _b === void 0 ? void 0 : _b.forEach((deco) => {
                    deco(stripe_webhook_controller_1.StripeWebhookController);
                });
            },
            inject: [stripe_constants_1.STRIPE_MODULE_CONFIG_TOKEN],
        },
        {
            provide: stripe_constants_1.STRIPE_CLIENT_TOKEN,
            useFactory: (config) => {
                return Object.keys(config).reduce((acc, countryCode) => {
                    const _a = config[countryCode], { apiKey, webhookConfig } = _a, options = __rest(_a, ["apiKey", "webhookConfig"]);
                    acc[countryCode] = new stripe_1.default(apiKey, Object.assign({ typescript: true, apiVersion: '2022-11-15' }, options));
                    return acc;
                }, {});
            },
            inject: [stripe_constants_1.STRIPE_MODULE_CONFIG_TOKEN],
        },
        stripe_webhook_service_1.StripeWebhookService,
        stripe_payload_service_1.StripePayloadService,
    ],
    exports: [stripe_constants_1.STRIPE_MODULE_CONFIG_TOKEN, stripe_constants_1.STRIPE_CLIENT_TOKEN],
}) {
    constructor(discover, externalContextCreator, stripeModuleConfig) {
        super();
        this.discover = discover;
        this.externalContextCreator = externalContextCreator;
        this.stripeModuleConfig = stripeModuleConfig;
        this.logger = new common_1.Logger(StripeModule_1.name);
    }
    async onModuleInit() {
        // If they didn't provide a webhook config secret there's no reason
        // to even attempt discovery
        if (Object.keys(this.stripeModuleConfig).length === 0) {
            return;
        }
        const noOneSecretProvided = Object.keys(this.stripeModuleConfig).length > 0 &&
            Object.keys(this.stripeModuleConfig).every((countryCode) => {
                var _a, _b;
                const countryConfig = this.stripeModuleConfig[countryCode];
                return (!((_a = countryConfig.webhookConfig) === null || _a === void 0 ? void 0 : _a.stripeSecrets.account) &&
                    !((_b = countryConfig.webhookConfig) === null || _b === void 0 ? void 0 : _b.stripeSecrets.connect));
            });
        if (noOneSecretProvided) {
            const errorMessage = 'missing stripe webhook secret. module is improperly configured and will be unable to process incoming webhooks from Stripe';
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
        this.logger.log('Initializing Stripe Module for webhooks');
        const [stripeWebhookService] = ((await this.discover.providersWithMetaAtKey(stripe_constants_1.STRIPE_WEBHOOK_SERVICE)) || []).map((x) => x.discoveredClass.instance);
        if (!stripeWebhookService ||
            !(stripeWebhookService instanceof stripe_webhook_service_1.StripeWebhookService)) {
            throw new Error('Could not find instance of Stripe Webhook Service');
        }
        const eventHandlerMeta = await this.discover.providerMethodsWithMetaAtKey(stripe_constants_1.STRIPE_WEBHOOK_HANDLER);
        const grouped = (0, lodash_1.groupBy)(eventHandlerMeta, (x) => x.discoveredMethod.parentClass.name);
        const webhookHandlers = (0, lodash_1.flatten)(Object.keys(grouped).map((x) => {
            this.logger.log(`Registering Stripe webhook handlers from ${x}`);
            return grouped[x].map(({ discoveredMethod, meta: eventType }) => ({
                key: eventType,
                handler: this.externalContextCreator.create(discoveredMethod.parentClass.instance, discoveredMethod.handler, discoveredMethod.methodName, undefined, // metadataKey
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
        }));
        const handleWebhook = async (webhookEvent) => {
            const { type } = webhookEvent;
            const handlers = webhookHandlers.filter((x) => x.key === type);
            const { loggingConfiguration } = this.stripeModuleConfig[Object.keys(this.stripeModuleConfig)[0]]
                .webhookConfig || {};
            if (handlers.length) {
                if (loggingConfiguration === null || loggingConfiguration === void 0 ? void 0 : loggingConfiguration.logMatchingEventHandlers) {
                    this.logger.log(`Received webhook event for ${type}. Forwarding to ${handlers.length} event handlers`);
                }
                await Promise.all(handlers.map((x) => x.handler(webhookEvent)));
            }
        };
        stripeWebhookService.handleWebhook = handleWebhook;
    }
};
StripeModule = StripeModule_1 = __decorate([
    (0, common_1.Module)({
        controllers: [stripe_webhook_controller_1.StripeWebhookController],
    }),
    __param(2, (0, stripe_decorators_1.InjectStripeModuleConfig)()),
    __metadata("design:paramtypes", [nestjs_discovery_1.DiscoveryService,
        external_context_creator_1.ExternalContextCreator, Object])
], StripeModule);
exports.StripeModule = StripeModule;
//# sourceMappingURL=stripe.module.js.map
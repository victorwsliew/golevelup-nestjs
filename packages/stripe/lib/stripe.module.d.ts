import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { OnModuleInit } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { StripeMultiCountryModuleConfig } from './stripe.interfaces';
declare const StripeModule_base: import('@golevelup/nestjs-modules').IConfigurableDynamicRootModule<
  StripeModule,
  StripeMultiCountryModuleConfig
>;
export declare class StripeModule
  extends StripeModule_base
  implements OnModuleInit
{
  private readonly discover;
  private readonly externalContextCreator;
  private readonly stripeModuleConfig;
  private readonly logger;
  constructor(
    discover: DiscoveryService,
    externalContextCreator: ExternalContextCreator,
    stripeModuleConfig: StripeMultiCountryModuleConfig
  );
  onModuleInit(): Promise<void>;
}
export {};
//# sourceMappingURL=stripe.module.d.ts.map

import { DynamicModule, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
  MainDatabaseModule,
  Discount,
  Family,
  FamilyExtraPackages,
  Feedback,
  FeedbackMetadata,
  FrequentlyQuestionMetaData,
  MemberFamily,
  Order,
  PackageCombo,
  PackageExtra,
  PackageMain,
  PaymentHistory,
  RmqModule,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountModule } from './discount/discount.module';
import { FinanceModule } from './finance/finance.module';
import { BullModule } from '@nestjs/bull';

const globalModule = (module: DynamicModule) => {
  module.global = true;
  return module;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_PAYMENT_QUEUE: Joi.string().required(),
      }),
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? './apps/payment/.env.production'
          : './apps/payment/.env',
    }),
    RmqModule,
    MainDatabaseModule,
    DiscountModule,
    TypeOrmModule.forFeature([
      PackageMain,
      PackageExtra,
      PackageCombo,
      Feedback,
      FeedbackMetadata,
      Order,
      Family,
      MemberFamily,
      FamilyExtraPackages,
      PaymentHistory,
      Discount,
      FrequentlyQuestionMetaData,
    ]),
    FinanceModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    globalModule(
      BullModule.registerQueue({
        name: 'default-checklist-queue',
      }),
    ),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [RmqModule, MainDatabaseModule],
})
export class PaymentModule {}

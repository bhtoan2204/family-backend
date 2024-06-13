import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthApiModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { FamilyModule } from './family/family.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { CrawlerModule } from './crawler/crawler.module';
import { CalendarModule } from './calendar/calendar.module';
import { UserModule } from './user/user.module';
import { GuidelineModule } from './guideline/guideline.module';
import { AppLoggerMiddleware } from './utils';
import { NotificationModule } from './notification/notification.module';
import { EducationModule } from './education/education.module';
import { HouseholdModule } from './household/household.module';
import { FinanceModule } from './finance/finance.module';
import { ShoppingModule } from './shopping/shopping.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MailModule } from './mailer/mailer.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(8080),
        SESSION_SECRET: Joi.string().required(),

        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
        RABBIT_MQ_PAYMENT_QUEUE: Joi.string().required(),
        RABBIT_MQ_FAMILY_QUEUE: Joi.string().required(),
        RABBIT_MQ_MAILER_QUEUE: Joi.string().required(),
        RABBIT_MQ_CHAT_QUEUE: Joi.string().required(),
        RABBIT_MQ_ROLE_QUEUE: Joi.string().required(),
        RABBIT_MQ_CRAWLER_QUEUE: Joi.string().required(),
        RABBIT_MQ_CALENDAR_QUEUE: Joi.string().required(),
        RABBIT_MQ_GUIDELINE_QUEUE: Joi.string().required(),
        RABBIT_MQ_NOTIFICATION_QUEUE: Joi.string().required(),
        RABBIT_MQ_EDUCATION_QUEUE: Joi.string().required(),
        RABBIT_MQ_ELASTICSEARCH_QUEUE: Joi.string().required(),
        RABBIT_MQ_HOUSEHOLD_QUEUE: Joi.string().required(),
        RABBIT_MQ_FINANCE_QUEUE: Joi.string().required(),
        RABBIT_MQ_SHOPPING_QUEUE: Joi.string().required(),
        RABBIT_MQ_INVOICE_QUEUE: Joi.string().required(),

        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_REDIRECT_URI: Joi.string().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_SECRET_REFRESH: Joi.string().required(),
      }),
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? './apps/gateway/.env.production'
          : './apps/gateway/.env',
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthApiModule,
    UserModule,
    PaymentModule,
    MailModule,
    FamilyModule,
    ChatModule,
    NotificationModule,
    CrawlerModule,
    CalendarModule,
    GuidelineModule,
    EducationModule,
    HouseholdModule,
    FinanceModule,
    ShoppingModule,
    InvoiceModule,
    AdminModule,
  ],
  providers: [],
})
export class GatewayModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}

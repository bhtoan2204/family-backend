import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { DatabaseModule, RmqModule } from '@app/common';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_PAYMENT_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/payment/.env'
    }),
    DatabaseModule,
    RmqModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

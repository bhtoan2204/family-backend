import { forwardRef, Module } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { ProxyModule } from './proxy/proxy.module';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { PostgresqlModule } from './postgresql/datastats.module';
import { DatafetcherModule } from './datafetcher/datafetcher.module';
import { PackageModule } from './package/package.module';
import { CacheModule, CacheStoreFactory } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { FeedbackModule } from './feedback/feedback.module';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { DiscountModule } from './discount/discount.module';

@Module({
  imports: [
    forwardRef(() => SearchModule),
    forwardRef(() => ProxyModule),
    forwardRef(() => RabbitMqModule),
    forwardRef(() => PostgresqlModule),
    forwardRef(() => DatafetcherModule),
    forwardRef(() => PackageModule),
    forwardRef(() => FeedbackModule),
    forwardRef(() => UsersModule),
    forwardRef(() => RoleModule),
    forwardRef(() => DiscountModule),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as unknown as CacheStoreFactory,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        no_ready_check: false,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class AdminModule {}

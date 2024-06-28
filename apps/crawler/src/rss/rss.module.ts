import { Module, forwardRef } from '@nestjs/common';
import { RssController } from './rss.controller';
import { RssService } from './rss.service';
import { CrawlerModule } from '../crawler.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Article,
  ArticleCategory,
  DatabaseModule,
  Enclosure,
} from '@app/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    forwardRef(() => CrawlerModule),
    DatabaseModule,
    TypeOrmModule.forFeature([Article, ArticleCategory, Enclosure]),
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
    BullModule.registerQueue({
      name: 'crawler-queue',
    }),
  ],
  controllers: [RssController],
  providers: [RssService],
})
export class RssModule {}

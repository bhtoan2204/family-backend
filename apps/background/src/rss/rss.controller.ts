import { Controller } from '@nestjs/common';
import { RssService } from './rss.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller()
export class RssController {
  constructor(
    private readonly rssService: RssService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('crawlerClient/getCategoriesNews')
  async getCategories(@Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.rssService.getCategoriesNews();
  }

  @EventPattern('crawlerClient/getNews')
  async getRssData(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.rssService.getArticles(
      data.id_article_category,
      data.page,
      data.itemsPerPage,
    );
  }
}

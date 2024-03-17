import { HttpException, Inject, Injectable } from "@nestjs/common";
import { CRAWLER_SERVICE } from "../utils/constant/services.constant";
import { ClientProxy } from "@nestjs/microservices";
import { lastValueFrom, timeout } from "rxjs";

@Injectable()
export class CrawlerService {
  constructor(
    @Inject(CRAWLER_SERVICE) private crawlerClient: ClientProxy
  ) { }

  async getRssData(type: string, page: number, itemsPerPage: number) {
    try {
      const response = this.crawlerClient.send('crawlerClient/getNews', { type, page, itemsPerPage })
        .pipe(
          timeout(5000),
        );
      const data = await lastValueFrom(response);
      return data;
    } catch (error) {
      throw new HttpException(error, error.statusCode);
  }
  }
}
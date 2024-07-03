import { RmqService } from '@app/common';
import { Controller } from '@nestjs/common';
import { DatafetcherService } from './datafetcher.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class DatafetcherController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly datafetcherService: DatafetcherService,
  ) {}

  @EventPattern('datafetcherClient/getIpData')
  async getIpData(@Ctx() context: RmqContext, @Payload() data: { ip: string }) {
    this.rmqService.ack(context);
    return this.datafetcherService.getIpData(data.ip);
  }

  @EventPattern('datafetcherClient/getSummary')
  async getSummary(@Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.datafetcherService.getSummary();
  }

  @EventPattern('datafetcherClient/getRevenueLast6Months')
  async getRevenueLast6Months(@Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.datafetcherService.getRevenueLast6Months();
  }

  @EventPattern('datafetcherClient/getListOrders')
  async getListOrders(
    @Ctx() context: RmqContext,
    @Payload()
    payload: {
      page: number;
      itemsPerPage: number;
      search: string;
      sortBy: string;
      sortDirection: 'ASC' | 'DESC' | null;
      type: 'ALL' | 'MAIN' | 'EXTRA' | 'COMBO';
    },
  ) {
    this.rmqService.ack(context);
    return this.datafetcherService.getListOrders(
      payload.page,
      payload.itemsPerPage,
      payload.search,
      payload.sortBy,
      payload.sortDirection,
      payload.type,
    );
  }
}

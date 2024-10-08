import { Controller } from '@nestjs/common';
import { IncomeService } from './income.service';
import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class IncomeController {
  constructor(
    private readonly incomeService: IncomeService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('financeClient/getIncomeSource')
  async getIncomeSource(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.getIncomeSource(data.id_user, data.id_family);
  }

  @EventPattern('financeClient/createIncomeSource')
  async createIncomeSource(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.createIncomeSource(data.id_user, data.dto);
  }

  @EventPattern('financeClient/updateIncomeSource')
  async updateIncomeSource(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.updateIncomeSource(data.id_user, data.dto);
  }

  @EventPattern('financeClient/deleteIncomeSource')
  async deleteIncomeSource(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.deleteIncomeSource(
      data.id_user,
      data.id_family,
      data.id_income_source,
    );
  }
  @EventPattern('financeClient/getIncomeByDate')
  async getIncomeByDate(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.getIncomeByDate(
      data.id_user,
      data.id_family,
      data.date,
    );
  }
  @EventPattern('financeClient/getIncomeByYear')
  async getIncomeByYear(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.getIncomeByYear(
      data.id_user,
      data.id_family,
      data.year,
    );
  }
  @EventPattern('financeClient/getIncomeByMonth')
  async getIncomeByMonth(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.getIncomeByMonth(
      data.id_user,
      data.id_family,
      data.month,
      data.year,
    );
  }

  @EventPattern('financeClient/getIncomeById')
  async getIncomeById(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.getIncomeById(
      data.id_user,
      data.id_family,
      data.id_income,
    );
  }

  @EventPattern('financeClient/getIncomeByDateRange')
  async getIncomeByDateRange(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.getIncomeByDateRange(data.id_user, data.dto);
  }

  @EventPattern('financeClient/createIncome')
  async createIncome(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.createIncome(data.id_user, data.dto);
  }

  @EventPattern('financeClient/updateIncome')
  async updateIncome(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.updateIncome(data.id_user, data.dto);
  }

  @EventPattern('financeClient/deleteIncome')
  async deleteIncome(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.incomeService.deleteIncome(
      data.id_user,
      data.id_family,
      data.id_income,
    );
  }

  @EventPattern('financeClient/addDefaultIncomeSource')
  async addDefaultIncomeSource(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return this.incomeService.addDefaultIncomeSource(data.id_family);
  }
}

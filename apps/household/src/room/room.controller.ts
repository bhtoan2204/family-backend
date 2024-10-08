import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { RoomService } from './room.service';

@Controller()
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('householdClient/getRooms')
  async getRooms(
    @Payload()
    data: {
      id_user: string;
      dto: {
        id_family: number;
        page: number;
        itemsPerPage: number;
        sortBy: string;
        sortDirection: 'ASC' | 'DESC';
      };
    },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return await this.roomService.getRooms(data.id_user, data.dto);
  }

  @EventPattern('householdClient/createRoom')
  async createRoom(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.roomService.createRoom(data.id_user, data.dto, data.file);
  }

  @EventPattern('householdClient/updateRoom')
  async updateRoom(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.roomService.updateRoom(data.id_user, data.dto, data.file);
  }

  @EventPattern('householdClient/deleteRoom')
  async deleteRoom(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.roomService.deleteRoom(
      data.id_user,
      data.id_family,
      data.id_room,
    );
  }
}

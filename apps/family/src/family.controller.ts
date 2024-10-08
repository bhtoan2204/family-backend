import { Controller } from '@nestjs/common';
import { FamilyService } from './family.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller()
export class FamilyController {
  constructor(
    private readonly familyService: FamilyService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('familyClient/checkIsMember')
  async checkIsMember(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.checkIsMember(data.id_user, data.id_family);
  }

  @EventPattern('familyClient/getFamily')
  async getFamily(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.getFamily(data.id_user, data.id_family);
  }
  @EventPattern('familyClient/getMember')
  async getMember(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.getMember(data.id_user);
  }
  @EventPattern('familyClient/getAllFamily')
  async getAllFamily(@Payload() id_user: string, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.getAllFamily(id_user);
  }

  @EventPattern('familyClient/getAllMember')
  async getAllMember(
    @Payload() data: { id_user; id_family; search: string },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return this.familyService.getAllMember(
      data.id_user,
      data.id_family,
      data.search,
    );
  }

  @EventPattern('familyClient/addMember')
  async addMember(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.addMember(data.id_user, data.memberFamilyDto);
  }

  @EventPattern('familyClient/deleteMember')
  async deleteMember(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.deleteMember(data.id_user, data.DeleteMemberDTO);
  }

  @EventPattern('familyClient/updateFamily')
  async updateFamily(
    @Payload() data: { id_user; updateFamilyDTO },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return this.familyService.updateFamily(data.id_user, data.updateFamilyDTO);
  }

  @EventPattern('familyClient/getIdsMember')
  async getIdsMember(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.getIdsMember(data.id_user, data.id_family);
  }

  @EventPattern('familyClient/changeAvatar')
  async changeAvatar(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.changeAvatar(
      data.id_user,
      data.id_family,
      data.file,
    );
  }

  @EventPattern('familyClient/checkExtraPackage')
  async checkExtraPackage(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.checkExtraPackage(
      data.id_family,
      data.permissions,
    );
  }

  @EventPattern('familyClient/leaveFamily')
  async leaveFamily(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.leaveFamily(data.id_user, data.id_family);
  }

  @EventPattern('familyClient/kickMember')
  async kickMember(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.kickMember(
      data.id_user,
      data.id_user_kick,
      data.id_family,
    );
  }

  @EventPattern('familyClient/termCheck')
  async termCheck(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.termCheck(data.id_family);
  }

  @EventPattern('familyClient/getFamilyRoles')
  async getFamilyRoles(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.getFamilyRoles();
  }

  @EventPattern('familyClient/assignFamilyRole')
  async assignFamilyRole(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return this.familyService.assignFamilyRole(data.dto);
  }

  @EventPattern('familyClient/getAllRole')
  async getAllRole(
    @Payload()
    data: {
      page: number;
      itemsPerPage: number;
      search: string;
      sortBy: string;
      sortDesc: boolean;
    },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return this.familyService.getAllRole(
      data.page,
      data.itemsPerPage,
      data.search,
      data.sortBy,
      data.sortDesc,
    );
  }

  @EventPattern('familyClient/createRole')
  async createRole(
    @Payload() data: { role_name_vn: string; role_name_en: string },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return this.familyService.createRole(data);
  }

  @EventPattern('familyClient/updateRole')
  async updateRole(
    @Payload()
    data: {
      id_family_role: number;
      role_name_vn: string;
      role_name_en: string;
    },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return this.familyService.updateRole(data);
  }
}

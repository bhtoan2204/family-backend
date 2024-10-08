import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly userService: UserService,
  ) {}

  @EventPattern('authClient/create_account')
  async handleUserCreated(@Payload() dto: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.createAccount(dto);
  }

  @EventPattern('authClient/get_profile')
  async handleGetProfile(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.getProfile(data);
  }

  @EventPattern('authClient/change_password')
  async handleChangePassword(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.changePassword(data.currentUser, data.dto);
  }

  @EventPattern('authClient/forgot_password')
  async handleForgotPassword(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.forgotPassword(data);
  }

  @EventPattern('authClient/update_profile')
  async handleUpdateProfile(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.updateProfile(data.user, data.data);
  }

  @EventPattern('authClient/change_avatar')
  async handleChangeAvatar(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.changeAvatar(data);
  }

  @EventPattern('authClient/sendOtpVerifyAccount')
  async handleSendOtpVerify(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.sendOtpVerify(data);
  }

  @EventPattern('authClient/getUserInfoByEmail')
  async handleGetUserInfoByEmail(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return await this.userService.getUserInfoByEmail(data.email);
  }

  @EventPattern('authClient/getUserInfoByPhone')
  async handleGetUserInfoByPhone(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return await this.userService.getUserInfoByPhone(data.phone);
  }

  @EventPattern('authClient/getUserById')
  async handleGetUserById(
    @Payload() id_user: string,
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return await this.userService.getUserById(id_user);
  }

  @EventPattern('authClient/getUsersByIds')
  async handleGetUsersByIds(
    @Payload() data: { ids: string[] },
    @Ctx() context: RmqContext,
  ) {
    this.rmqService.ack(context);
    return await this.userService.getUsersByIds(data.ids);
  }

  @EventPattern('authClient/verifyAccount')
  async sendUserConfirmation(@Payload() dto: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.verifyAccount(dto);
  }

  @EventPattern('authClient/check_otp')
  async handleCheckOTP(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.checkOTP(data);
  }

  @EventPattern('authClient/reset_password')
  async handleResetPassword(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.userService.resetPassword(data);
  }
}

import { RmqService } from '@app/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly authService: AuthService,
  ) {}

  @EventPattern('authClient/local/login')
  async handleLocalLogin(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.localLogin(data);
  }

  @EventPattern('authClient/google_login')
  async handleGoogleLogin(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.googleValidate(
      data.accessToken,
      data.profile,
    );
  }

  @EventPattern('authClient/facebook_login')
  async handleFacebookLogin(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.facebookValidate(
      data.accessToken,
      data.profile,
    );
  }

  @EventPattern('authClient/refresh_token')
  async handleRefreshToken(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.refreshToken(
      data.currentUser,
      data.refreshToken,
    );
  }

  @EventPattern('authClient/logout')
  async handleLogout(@Payload() id_user, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.logout(id_user);
  }

  @EventPattern('authClient/validateUserId')
  async handleValidateUserId(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.validateUserId(data.id_user);
  }

  @EventPattern('authClient/validateUser')
  async handleValidateUser(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    const { email, password } = data;
    return await this.authService.validateLocalUser(email, password);
  }

  @EventPattern('authClient/saveFCMToken')
  async handleSaveFCMToken(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.saveFCMToken(data.userId, data.fcmToken);
  }

  @EventPattern('authClient/deleteFCMToken')
  async handleDeleteFCMToken(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.deleteFCMToken(data.userId, data.fcmToken);
  }

  @EventPattern('authClient/getUsersAdmin')
  async handleGetUsersAdmin(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.getUsersAdmin(
      data.page,
      data.itemsPerPage,
      data.search,
      data.sortBy,
      data.sortDesc,
    );
  }

  @EventPattern('authClient/banUser')
  async handleBanUser(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.banUser(data.id_user);
  }

  @EventPattern('authClient/unbanUser')
  async handleUnbanUser(@Payload() data: any, @Ctx() context: RmqContext) {
    this.rmqService.ack(context);
    return await this.authService.unbanUser(data.id_user);
  }
}

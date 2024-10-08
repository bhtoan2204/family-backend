import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageFileInterceptor } from '../utils/interceptor/imageFile.interceptor';
import { CurrentUser, JwtAuthGuard } from '../utils';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CreateAccountDto } from './dto/createAccount.dto';
import { UserService } from './user.service';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { CheckOTPDto } from './dto/checkOtpForgot.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as validator from 'validator';
import { VerifyAccountDto } from './dto/verifyAccount.dto';
import { CreateAccountOTPDto } from './dto/createOTPAccount.dto';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create account' })
  @Post('register/createAccount')
  async createAccountForTest(@Body() dto: CreateAccountDto) {
    return this.userService.createAccount(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP verify account' })
  @Post('register/sendOtpVerifyAccount')
  async sendOtpVerifyAccount(@Body() dto: CreateAccountOTPDto) {
    return this.userService.sendOtpVerifyAccount(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify account' })
  @Post('register/verifyAccount')
  async verifyAccount(@Body() dto: VerifyAccountDto) {
    return this.userService.verifyAccount(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Profile' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user) {
    return this.userService.getProfile(user);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change Password' })
  @UseGuards(JwtAuthGuard)
  @Post('changePassword')
  async changePassword(@CurrentUser() user, @Body() data: ChangePasswordDto) {
    return this.userService.changePassword(user, data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot Password' })
  @UseGuards(ThrottlerGuard)
  @Post('forgotPassword')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.userService.forgotPassword(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check OTP forgot password' })
  @Post('checkOTPForgotPassword')
  async checkOTP(@Body() data: CheckOTPDto) {
    return this.userService.checkOTP(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset Password' })
  @Post('resetPassword')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.userService.resetPassword(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Profile' })
  @UseGuards(JwtAuthGuard)
  @Put('updateProfile')
  async updateProfile(@CurrentUser() user, @Body() data: UpdateProfileDto) {
    return this.userService.updateProfile(user, data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change Avatar' })
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', new ImageFileInterceptor().createMulterOptions()),
  )
  @Put('changeAvatar')
  async changeAvatar(
    @CurrentUser() user,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.changeAvatar(user, file);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get User Info by email' })
  @ApiQuery({ name: 'email', required: true })
  @UseGuards(JwtAuthGuard)
  @Get('getUserInfoByEmail')
  async getUserInfoByEmail(@Query('email') email: string) {
    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    return this.userService.getUserInfoByEmail(email);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get User Info by phone' })
  @ApiQuery({ name: 'phone', required: true })
  @UseGuards(JwtAuthGuard)
  @Get('getUserInfoByPhone')
  async getUserInfoByPhone(@Query('phone') phone: string) {
    return this.userService.getUserInfoByPhone(phone);
  }
}

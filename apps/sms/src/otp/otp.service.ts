import { OTP } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TwilioService } from 'nestjs-twilio';
import { EntityManager } from 'typeorm';

@Injectable()
export class OTPService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly configService: ConfigService,
    private readonly entityManager: EntityManager
  ) { }

  async sendValidatePhoneSms(validateData) {
    try {
      const query = 'SELECT * FROM f_generate_otp($1)';
      const parameters = [validateData.id_user];

      const data = await this.entityManager.query(query, parameters);

      return data;
      // const message = await this.twilioService.client.messages.create({
      //   body: 'Your Verification Code of Famfund is: ' + data,
      //   from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      //   to: validateData.phone,
      // });

      // return message;
    }
    catch (error) {
      throw error;
    }
  }
}
import { NestFactory } from '@nestjs/core';
import { BackgroundModule } from './background.module';
import { initTracing, RmqService } from '@app/common';

async function bootstrap() {
  await initTracing('background');
  const app = await NestFactory.create(BackgroundModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions('BACKGROUND'));
  app.startAllMicroservices();
  await app.init();
}
bootstrap();

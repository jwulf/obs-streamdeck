import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// tslint:disable-next-line: no-var-requires
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(9001);
}
bootstrap();

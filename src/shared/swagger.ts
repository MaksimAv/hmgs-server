import { patchNestJsSwagger } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { COOKIE_REFRESH_TOKEN } from '../modules/auth/auth.api.constants';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication<any>) => {
  patchNestJsSwagger();

  const config = new DocumentBuilder()
    .setTitle('hotel-management-system-api')
    .setDescription('Open API docs for system routes')
    .addBearerAuth()
    .addCookieAuth(COOKIE_REFRESH_TOKEN)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
};

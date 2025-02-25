/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { JSON_ACCESS_TOKEN } from '../../src/modules/auth/constants/token.constants';
import * as cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';
import { UNAUTHORIZED_USER } from '../data/user';

describe('Auth Api (e2e)', () => {
  const AUTH_ROUTE = '/auth';
  const USER_DATA = UNAUTHORIZED_USER;

  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe());
    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Registration', () => {
    it('Should successfully register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post(`${AUTH_ROUTE}/sign-up`)
        .send(USER_DATA)
        .expect(201);

      expect(response.body[JSON_ACCESS_TOKEN]).toBeTruthy();
      expect(response.headers['set-cookie'].length).toBe(1);
    });
  });

  describe('Authentication', () => {
    let cookie: string[];

    it('Should login a user with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(`${AUTH_ROUTE}/sign-in`)
        .send({ login: USER_DATA.phone, password: USER_DATA.password })
        .expect(201);

      expect(response.body[JSON_ACCESS_TOKEN]).toBeTruthy();
      expect(response.headers['set-cookie'].length).toBe(1);
      cookie = response.headers['set-cookie'] as unknown as string[];
    });

    it('Should refresh token when valid refresh token is provided', async () => {
      const response = await request(app.getHttpServer())
        .post(`${AUTH_ROUTE}/refresh`)
        .set('Cookie', cookie)
        .send({ login: USER_DATA.phone, password: USER_DATA.password })
        .expect(201);

      expect(response.body[JSON_ACCESS_TOKEN]).toBeTruthy();
      expect(response.headers['set-cookie'].length).toBe(1);
    });

    it('Should logout a user', async () => {
      await request(app.getHttpServer())
        .post(`${AUTH_ROUTE}/sign-out`)
        .set('Cookie', cookie)
        .send({ login: USER_DATA.phone, password: USER_DATA.password })
        .expect(204);
    });
  });
});

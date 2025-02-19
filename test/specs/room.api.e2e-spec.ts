/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RoomFactory } from '../factory';
import { AppModule } from '../../src/app.module';
import { RoomPrice } from '../../src/modules/room/entities/room.price.entity';
import { RoomStatus } from '../../src/modules/room/entities/room.status.entity';
import { cleanupDatabase } from '../scripts/cleanup.database';
import { RoomStatusEnum } from '../../src/modules/room/enums/room.status.enum';
import { RoomStatusRequestEnum } from 'hmgs-contracts';

describe('Room Api (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let roomPriceRepository: Repository<RoomPrice>;
  let roomStatusRepository: Repository<RoomStatus>;
  let roomFactory: RoomFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    roomPriceRepository = moduleFixture.get<Repository<RoomPrice>>(
      getRepositoryToken(RoomPrice),
    );
    roomStatusRepository = moduleFixture.get<Repository<RoomStatus>>(
      getRepositoryToken(RoomStatus),
    );

    roomFactory = new RoomFactory(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CASE. Statuses creation and search for available rooms', () => {
    let roomId: number;

    beforeAll(async () => {
      roomId = (
        await roomFactory.create({
          regularIsAvailable: true,
          regularStatus: RoomStatusEnum.AVAILABLE_FOR_BOOKING,
        })
      ).id;
    });

    afterAll(async () => {
      await cleanupDatabase(dataSource);
    });

    const TEST_DATA = [
      {
        startDate: '2025-01-01T14:00:00.000Z',
        endDate: '2025-01-07T12:00:00.000Z',
        status: RoomStatusRequestEnum.BOOKED,
      },
      {
        startDate: '2025-01-07T14:00:00.000Z',
        endDate: '2025-01-10T12:00:00.000Z',
        status: RoomStatusRequestEnum.BOOKED,
      },
      {
        startDate: '2025-01-07T14:00:00.000Z',
        endDate: '2025-01-10T12:00:00.000Z',
        status: RoomStatusRequestEnum.AVAILABLE_FOR_BOOKING,
      },
      {
        startDate: '2026-01-01T14:00:00.000Z',
        endDate: '2026-01-05T12:00:00.000Z',
        status: RoomStatusRequestEnum.MAINTENANCE,
      },
      {
        startDate: '2026-01-01T14:00:00.000Z',
        endDate: '2026-01-08T12:00:00.000Z',
        status: RoomStatusRequestEnum.MAINTENANCE,
      },
    ];

    it('Set booked status', async () => {
      const data = TEST_DATA[0];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/status`)
        .send(data)
        .expect(201);

      const statuses = await roomStatusRepository.find({
        order: { startDateTime: 'ASC' },
      });
      expect(statuses[0].startDateTime.toISOString()).toBe(data.startDate);
      expect(statuses[0].endDateTime.toISOString()).toBe(data.endDate);
      expect(statuses[0].status).toBe(data.status);
      expect(statuses[0].roomId).toBe(roomId);
    });

    it('Set new booked status', async () => {
      const data = TEST_DATA[1];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/status`)
        .send(data)
        .expect(201);

      const statuses = await roomStatusRepository.find({
        order: { startDateTime: 'ASC' },
      });
      expect(statuses[1].startDateTime.toISOString()).toBe(data.startDate);
      expect(statuses[1].endDateTime.toISOString()).toBe(data.endDate);
      expect(statuses[1].status).toBe(data.status);
      expect(statuses[1].roomId).toBe(roomId);
    });

    it('Replace booked status on available', async () => {
      const data = TEST_DATA[2];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/status`)
        .send(data)
        .expect(201);

      const statuses = await roomStatusRepository.find({
        order: { startDateTime: 'ASC' },
      });
      console.log(statuses);
      expect(statuses[1].startDateTime.toISOString()).toBe(data.startDate);
      expect(statuses[1].endDateTime.toISOString()).toBe(data.endDate);
      expect(statuses[1].status).toBe(data.status);
      expect(statuses[1].roomId).toBe(roomId);
    });

    it('Room should be available from 07.01.2025 to 15.01.2025', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rooms/available/period`)
        .query({
          startDate: '2025-01-07 14:00:00',
          endDate: '2025-01-15 12:00:00',
        })
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(roomId);
    });

    it('Room should be unavailable from 01.01.2025 to 07.01.2025', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rooms/available/period`)
        .query({
          startDate: '2025-01-01 14:00:00',
          endDate: '2025-01-07 12:00:00',
        })
        .expect(200);

      expect(response.body.length).toBe(0);
    });

    it('Set maintenance status', async () => {
      const data = TEST_DATA[3];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/status`)
        .send(data)
        .expect(201);

      const statuses = await roomStatusRepository.find({
        where: {
          startDateTime: MoreThanOrEqual(new Date('2026-01-01 00:00:00')),
        },
        order: { startDateTime: 'ASC' },
      });
      expect(statuses[0].startDateTime.toISOString()).toBe(data.startDate);
      expect(statuses[0].endDateTime.toISOString()).toBe(data.endDate);
      expect(statuses[0].status).toBe(data.status);
      expect(statuses[0].roomId).toBe(roomId);
    });

    it('Extend maintenance status', async () => {
      const data = TEST_DATA[4];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/status`)
        .send(data)
        .expect(201);

      const statuses = await roomStatusRepository.find({
        where: {
          startDateTime: MoreThanOrEqual(new Date('2026-01-01 00:00:00')),
        },
        order: { startDateTime: 'ASC' },
      });
      expect(
        statuses.every((i) => i.status === RoomStatusEnum.MAINTENANCE),
      ).toBe(true);
    });
  });

  describe('CASE. Multi-price creation in one month', () => {
    let roomId: number;

    beforeAll(async () => {
      roomId = (await roomFactory.create()).id;
    });

    afterAll(async () => {
      await cleanupDatabase(dataSource);
    });

    const TEST_DATA = [
      { startDate: '2025-01-01', endDate: '2025-01-31', price: 2500 },
      { startDate: '2025-01-01', endDate: '2025-01-05', price: 2700 },
      { startDate: '2025-01-03', endDate: '2025-01-07', price: 2400 },
      { startDate: '2025-01-10', endDate: '2025-01-15', price: 2200 },
      { startDate: '2025-01-06', endDate: '2025-01-12', price: 2000 },
    ];

    it('Set price at 2500 from 01.01 to 01.31', async () => {
      const data = TEST_DATA[0];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await roomPriceRepository.find({
        order: { startDate: 'ASC' },
      });
      expect(prices[0]).toMatchObject(data);
    });

    it('Set price at 2700 from 01.01 to 05.01', async () => {
      const data = TEST_DATA[1];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await roomPriceRepository.find({
        order: { startDate: 'ASC' },
      });
      expect(prices.length).toBe(2);
      expect(prices[0]).toMatchObject(data);
      expect(prices[1]).toMatchObject({
        startDate: '2025-01-06',
        endDate: '2025-01-31',
        price: 2500,
      });
    });

    it('Set price at 2400 from 03.01 to 07.01', async () => {
      const data = TEST_DATA[2];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await roomPriceRepository.find({
        order: { startDate: 'ASC' },
      });
      expect(prices.length).toBe(3);
      expect(prices[0]).toMatchObject({
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        price: 2700,
      });
      expect(prices[1]).toMatchObject(data);
      expect(prices[2]).toMatchObject({
        startDate: '2025-01-08',
        endDate: '2025-01-31',
        price: 2500,
      });
    });

    it('Set price at 2200 from 10.01 to 15.01', async () => {
      const data = TEST_DATA[3];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await roomPriceRepository.find({
        order: { startDate: 'ASC' },
      });
      expect(prices.length).toBe(5);
      expect(prices[0]).toMatchObject({
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        price: 2700,
      });
      expect(prices[1]).toMatchObject({
        startDate: '2025-01-03',
        endDate: '2025-01-07',
        price: 2400,
      });
      expect(prices[2]).toMatchObject({
        startDate: '2025-01-08',
        endDate: '2025-01-09',
        price: 2500,
      });
      expect(prices[3]).toMatchObject(data);
      expect(prices[4]).toMatchObject({
        startDate: '2025-01-16',
        endDate: '2025-01-31',
        price: 2500,
      });
    });

    it('Set price at 2000 from 06.01 at 12.01', async () => {
      const data = TEST_DATA[4];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await roomPriceRepository.find({
        order: { startDate: 'ASC' },
      });
      expect(prices.length).toBe(5);
      expect(prices[0]).toMatchObject({
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        price: 2700,
      });
      expect(prices[1]).toMatchObject({
        startDate: '2025-01-03',
        endDate: '2025-01-05',
        price: 2400,
      });
      expect(prices[2]).toMatchObject(data);
      expect(prices[3]).toMatchObject({
        startDate: '2025-01-13',
        endDate: '2025-01-15',
        price: 2200,
      });
      expect(prices[4]).toMatchObject({
        startDate: '2025-01-16',
        endDate: '2025-01-31',
        price: 2500,
      });
    });
  });
});

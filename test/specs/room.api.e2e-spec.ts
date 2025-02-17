import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RoomFactory } from '../factory';
import { AppModule } from '../../src/app.module';
import { RoomPrice } from '../../src/modules/room/entities/room.price.entity';

describe('Room Api (e2e)', () => {
  let app: INestApplication<App>;
  let repository: Repository<RoomPrice>;
  let dataSource: DataSource;

  let roomId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    repository = moduleFixture.get<Repository<RoomPrice>>(
      getRepositoryToken(RoomPrice),
    );

    const roomFactory = new RoomFactory(dataSource);
    roomId = (await roomFactory.create()).id;
  });

  afterAll(async () => {
    await app.close();
  });

  test.todo('CASE. Basic room operations');

  describe('CASE. Multi-price creation in one month', () => {
    const TEST_DATA = [
      { startDate: '2025-01-01', endDate: '2025-01-31', price: 2500 },
      { startDate: '2025-01-01', endDate: '2025-01-05', price: 2700 },
      { startDate: '2025-01-03', endDate: '2025-01-07', price: 2400 },
      { startDate: '2025-01-10', endDate: '2025-01-15', price: 2200 },
      { startDate: '2025-01-06', endDate: '2025-01-12', price: 2000 },
    ];

    it('01.01 - 01.31 (2500)', async () => {
      const data = TEST_DATA[0];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await repository.find({ order: { startDate: 'ASC' } });
      expect(prices[0]).toMatchObject(data);
    });

    it('01.01 - 05.01 (2700)', async () => {
      const data = TEST_DATA[1];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await repository.find({ order: { startDate: 'ASC' } });
      expect(prices.length).toBe(2);
      expect(prices[0]).toMatchObject(data);
      expect(prices[1]).toMatchObject({
        startDate: '2025-01-06',
        endDate: '2025-01-31',
        price: 2500,
      });
    });

    it('03.01 - 07.01 (2400)', async () => {
      const data = TEST_DATA[2];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await repository.find({ order: { startDate: 'ASC' } });
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

    it('10.01 - 15.01 (2200)', async () => {
      const data = TEST_DATA[3];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await repository.find({ order: { startDate: 'ASC' } });
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

    it('06.01 - 12.01 (2000)', async () => {
      const data = TEST_DATA[4];
      await request(app.getHttpServer())
        .post(`/rooms/${roomId}/price`)
        .send(data)
        .expect(201);

      const prices = await repository.find({ order: { startDate: 'ASC' } });
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

  test.todo('CASE. Multiple statuses creation');
});

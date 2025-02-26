import { Test, TestingModule } from '@nestjs/testing';
import { CookieManagerService } from './cookie.manager.service';

describe('CookieManagerService', () => {
  let service: CookieManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CookieManagerService],
    }).compile();

    service = module.get<CookieManagerService>(CookieManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

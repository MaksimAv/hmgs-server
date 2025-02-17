import { dropDatabase } from '../scripts/drop.database';
import { prepareDatabase } from '../scripts/prepare.database';

beforeAll(async () => {
  await prepareDatabase();
});

afterAll(async () => {
  await dropDatabase();
});

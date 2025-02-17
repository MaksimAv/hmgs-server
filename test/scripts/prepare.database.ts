import { DataSource } from 'typeorm';
import { TESTING_DATA_SOURCE } from '../../src/database/config/typeorm.testing.config';

export const prepareDatabase = async () => {
  const dataSource: DataSource = TESTING_DATA_SOURCE;
  if (!dataSource.isInitialized) await dataSource.initialize();
  await dataSource.runMigrations();
  if (dataSource.isInitialized) await dataSource.destroy();
};

import { DataSource } from 'typeorm';

export const cleanupDatabase = async (dataSource: DataSource) => {
  const entities = dataSource.entityMetadatas;
  for (const entity of entities) {
    await dataSource.query(`TRUNCATE TABLE ${entity.tableName} CASCADE`);
  }
};

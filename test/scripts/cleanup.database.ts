import { DataSource } from 'typeorm';

export const cleanupDatabase = async (dataSource: DataSource) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.startTransaction();
  try {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      await queryRunner.query(`TRUNCATE TABLE ${entity.tableName} CASCADE`);
    }
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

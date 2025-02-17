import { MigrationInterface, QueryRunner } from 'typeorm';

export class Changes1739719716077 implements MigrationInterface {
  name = 'Changes1739719716077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "room_price" ("id" SERIAL NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "price" double precision NOT NULL DEFAULT '0', "roomId" integer, CONSTRAINT "PK_3e342992098f49e876a529edcdd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."room_status_status_enum" AS ENUM('AVAILABLE_FOR_BOOKING', 'OUT_OF_ORDER', 'STAYING', 'LONG_STAYING', 'RESERVED', 'BOOKED', 'MAINTENANCE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_status" ("id" SERIAL NOT NULL, "startDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "endDateTime" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."room_status_status_enum" NOT NULL DEFAULT 'OUT_OF_ORDER', "isAvailable" boolean NOT NULL DEFAULT false, "roomId" integer, CONSTRAINT "PK_39a39d2b2147e6aa7f080725826" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."room_regularstatus_enum" AS ENUM('AVAILABLE_FOR_BOOKING', 'OUT_OF_ORDER', 'STAYING', 'LONG_STAYING', 'RESERVED', 'BOOKED', 'MAINTENANCE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "room" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "capacity" integer NOT NULL, "cleaningStatus" character varying NOT NULL, "visibility" character varying NOT NULL, "currencyCode" character varying NOT NULL, "size" double precision NOT NULL DEFAULT '0', "floor" integer, "minStayDays" integer NOT NULL DEFAULT '0', "maxStayDays" integer NOT NULL DEFAULT '90', "categoryId" integer NOT NULL, "regularPrice" double precision NOT NULL DEFAULT '0', "regularIsAvailable" boolean NOT NULL DEFAULT false, "regularStatus" "public"."room_regularstatus_enum" NOT NULL DEFAULT 'OUT_OF_ORDER', CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_category" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_f4f2ee1b5d223a50dd25922773a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_price" ADD CONSTRAINT "FK_7a7bbab94725707012059949771" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_status" ADD CONSTRAINT "FK_a6e06b4acf1f0dbdf6ef4cad439" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room" ADD CONSTRAINT "FK_714dff0be75b1eee27b381f4c44" FOREIGN KEY ("categoryId") REFERENCES "room_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room" DROP CONSTRAINT "FK_714dff0be75b1eee27b381f4c44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_status" DROP CONSTRAINT "FK_a6e06b4acf1f0dbdf6ef4cad439"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_price" DROP CONSTRAINT "FK_7a7bbab94725707012059949771"`,
    );
    await queryRunner.query(`DROP TABLE "room_category"`);
    await queryRunner.query(`DROP TABLE "room"`);
    await queryRunner.query(`DROP TYPE "public"."room_regularstatus_enum"`);
    await queryRunner.query(`DROP TABLE "room_status"`);
    await queryRunner.query(`DROP TYPE "public"."room_status_status_enum"`);
    await queryRunner.query(`DROP TABLE "room_price"`);
  }
}

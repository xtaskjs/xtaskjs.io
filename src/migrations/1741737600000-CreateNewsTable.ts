import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNewsTable1741737600000 implements MigrationInterface {
  name = "CreateNewsTable1741737600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "news",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "title",
            type: "character varying",
            length: "180",
            isNullable: false,
          },
          {
            name: "slug",
            type: "character varying",
            length: "200",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "summary",
            type: "text",
            isNullable: false,
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "image_url",
            type: "character varying",
            length: "500",
            isNullable: true,
          },
          {
            name: "is_published",
            type: "boolean",
            default: true,
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "now()",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            default: "now()",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("news");
  }
}

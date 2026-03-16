import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1741824000000 implements MigrationInterface {
  name = "CreateUsersTable1741824000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "full_name",
            type: "character varying",
            length: "180",
            isNullable: false,
          },
          {
            name: "username",
            type: "character varying",
            length: "60",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "email",
            type: "character varying",
            length: "180",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "password_hash",
            type: "character varying",
            length: "255",
            isNullable: false,
          },
          {
            name: "role",
            type: "character varying",
            length: "20",
            isNullable: false,
            default: "'user'",
          },
          {
            name: "is_active",
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
    await queryRunner.dropTable("users");
  }
}

import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddUserAccessTracking1742083200000 implements MigrationInterface {
  name = "AddUserAccessTracking1742083200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "registration_ip_address",
        type: "character varying",
        length: "64",
        isNullable: true,
      }),
      new TableColumn({
        name: "registration_country_code",
        type: "character varying",
        length: "8",
        isNullable: true,
      }),
      new TableColumn({
        name: "registration_country_name",
        type: "character varying",
        length: "120",
        isNullable: true,
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: "user_login_events",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "user_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "ip_address",
            type: "character varying",
            length: "64",
            isNullable: true,
          },
          {
            name: "country_code",
            type: "character varying",
            length: "8",
            isNullable: true,
          },
          {
            name: "country_name",
            type: "character varying",
            length: "120",
            isNullable: true,
          },
          {
            name: "region",
            type: "character varying",
            length: "120",
            isNullable: true,
          },
          {
            name: "city",
            type: "character varying",
            length: "120",
            isNullable: true,
          },
          {
            name: "location_label",
            type: "character varying",
            length: "255",
            isNullable: true,
          },
          {
            name: "user_agent",
            type: "character varying",
            length: "512",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "now()",
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
        indices: [
          {
            name: "IDX_user_login_events_user_id_created_at",
            columnNames: ["user_id", "created_at"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("user_login_events");
    await queryRunner.dropColumn("users", "registration_country_name");
    await queryRunner.dropColumn("users", "registration_country_code");
    await queryRunner.dropColumn("users", "registration_ip_address");
  }
}
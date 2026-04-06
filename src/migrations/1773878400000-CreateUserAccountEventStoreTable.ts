import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUserAccountEventStoreTable1773878400000 implements MigrationInterface {
  name = "CreateUserAccountEventStoreTable1773878400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("user_account_event_store");
    if (hasTable) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: "user_account_event_store",
        columns: [
          { name: "id", type: "varchar", isPrimary: true },
          { name: "stream", type: "varchar", isNullable: false },
          { name: "stream_id", type: "varchar", isNullable: false },
          { name: "stream_key", type: "varchar", isNullable: false },
          { name: "aggregate_name", type: "varchar", isNullable: false },
          { name: "event_name", type: "varchar", isNullable: false },
          { name: "version", type: "int", isNullable: false },
          { name: "occurred_at", type: "timestamp", isNullable: false },
          { name: "metadata", type: "text", isNullable: false },
          { name: "payload", type: "text", isNullable: false },
        ],
        indices: [
          new TableIndex({
            name: "user_account_event_store_stream_version_idx",
            columnNames: ["stream_key", "version"],
            isUnique: true,
          }),
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("user_account_event_store");
    if (!hasTable) {
      return;
    }

    await queryRunner.dropTable("user_account_event_store");
  }
}
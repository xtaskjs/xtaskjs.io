import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserCommunicationPreferences1773792000000 implements MigrationInterface {
  name = "AddUserCommunicationPreferences1773792000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "receive_news_updates",
        type: "boolean",
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: "newsletter_subscribed",
        type: "boolean",
        default: false,
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "newsletter_subscribed");
    await queryRunner.dropColumn("users", "receive_news_updates");
  }
}
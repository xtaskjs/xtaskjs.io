import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserSecurityColumns1741996800000 implements MigrationInterface {
  name = "AddUserSecurityColumns1741996800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("users", [
      new TableColumn({
        name: "email_verified",
        type: "boolean",
        isNullable: false,
        default: true,
      }),
      new TableColumn({
        name: "email_verification_code_hash",
        type: "character varying",
        length: "255",
        isNullable: true,
      }),
      new TableColumn({
        name: "email_verification_expires_at",
        type: "timestamp with time zone",
        isNullable: true,
      }),
      new TableColumn({
        name: "two_factor_code_hash",
        type: "character varying",
        length: "255",
        isNullable: true,
      }),
      new TableColumn({
        name: "two_factor_expires_at",
        type: "timestamp with time zone",
        isNullable: true,
      }),
      new TableColumn({
        name: "password_reset_code_hash",
        type: "character varying",
        length: "255",
        isNullable: true,
      }),
      new TableColumn({
        name: "password_reset_expires_at",
        type: "timestamp with time zone",
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "password_reset_expires_at");
    await queryRunner.dropColumn("users", "password_reset_code_hash");
    await queryRunner.dropColumn("users", "two_factor_expires_at");
    await queryRunner.dropColumn("users", "two_factor_code_hash");
    await queryRunner.dropColumn("users", "email_verification_expires_at");
    await queryRunner.dropColumn("users", "email_verification_code_hash");
    await queryRunner.dropColumn("users", "email_verified");
  }
}
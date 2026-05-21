import { Service } from "@xtaskjs/core";
import bcrypt from "bcryptjs";
import { DataSource, TypeOrmSeeder } from "@xtaskjs/typeorm";
import { AppConfig } from "../../../../shared/infrastructure/config/app-config";
import { EmailAddress } from "../../../../shared/domain/value-objects/email-address";
import { Username } from "../../../../shared/domain/value-objects/username";
import { UserTypeOrmEntity } from "../user.typeorm-entity";

@Service({ scope: "singleton" })
@TypeOrmSeeder({ dataSourceName: "default", order: 1 })
export class AdminAccountSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(UserTypeOrmEntity);
    const username = Username.from(AppConfig.admin.username).value;
    const email = EmailAddress.from(AppConfig.admin.email).value;
    const passwordHash = await this.resolveAdminPasswordHash();
    const existing = await repository.findOne({ where: { username } });

    if (!existing) {
      await repository.save(
        repository.create({
          fullName: "Administrator",
          username,
          email,
          receiveNewsUpdates: false,
          newsletterSubscribed: false,
          passwordHash,
          role: "admin",
          isActive: true,
          emailVerified: true,
          emailVerificationCodeHash: null,
          emailVerificationExpiresAt: null,
          twoFactorCodeHash: null,
          twoFactorExpiresAt: null,
          passwordResetCodeHash: null,
          passwordResetExpiresAt: null,
          registrationIpAddress: null,
          registrationCountryCode: null,
          registrationCountryName: null,
        })
      );
      return;
    }

    const updates: Record<string, unknown> = {};

    if (existing.role !== "admin") {
      updates.role = "admin";
    }
    if (!existing.isActive) {
      updates.isActive = true;
    }
    if (!existing.emailVerified) {
      updates.emailVerified = true;
    }
    if (existing.passwordHash !== passwordHash) {
      updates.passwordHash = passwordHash;
    }
    if (existing.email !== email) {
      updates.email = email;
    }
    if (existing.fullName !== "Administrator") {
      updates.fullName = "Administrator";
    }

    if (Object.keys(updates).length > 0) {
      await repository.update({ id: existing.id }, updates);
    }
  }

  private async resolveAdminPasswordHash(): Promise<string> {
    const configuredHash = AppConfig.admin.passwordHash?.trim();
    if (configuredHash) {
      return configuredHash;
    }

    return bcrypt.hash(AppConfig.admin.password, 10);
  }
}

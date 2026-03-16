import { EntitySchema } from "typeorm";
import type { User } from "../../domain/user";

export const UserTypeOrmEntity = new EntitySchema<User>({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: Number, primary: true, generated: true },
    fullName: { type: String, name: "full_name", length: 180 },
    username: { type: String, length: 60, unique: true },
    email: { type: String, length: 180, unique: true },
    passwordHash: { type: String, name: "password_hash", length: 255 },
    role: { type: String, length: 20, default: "user" },
    isActive: { type: Boolean, name: "is_active", default: true },
    emailVerified: { type: Boolean, name: "email_verified", default: true },
    emailVerificationCodeHash: { type: String, name: "email_verification_code_hash", length: 255, nullable: true },
    emailVerificationExpiresAt: { type: Date, name: "email_verification_expires_at", nullable: true },
    twoFactorCodeHash: { type: String, name: "two_factor_code_hash", length: 255, nullable: true },
    twoFactorExpiresAt: { type: Date, name: "two_factor_expires_at", nullable: true },
    passwordResetCodeHash: { type: String, name: "password_reset_code_hash", length: 255, nullable: true },
    passwordResetExpiresAt: { type: Date, name: "password_reset_expires_at", nullable: true },
    registrationIpAddress: { type: String, name: "registration_ip_address", length: 64, nullable: true },
    registrationCountryCode: { type: String, name: "registration_country_code", length: 8, nullable: true },
    registrationCountryName: { type: String, name: "registration_country_name", length: 120, nullable: true },
    createdAt: { type: Date, name: "created_at", createDate: true },
    updatedAt: { type: Date, name: "updated_at", updateDate: true },
  },
});

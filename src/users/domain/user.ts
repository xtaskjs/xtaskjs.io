export type UserRole = "admin" | "user";

export type User = {
  readonly id: number;
  readonly fullName: string;
  readonly username: string;
  readonly email: string;
  readonly receiveNewsUpdates: boolean;
  readonly newsletterSubscribed: boolean;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly emailVerified: boolean;
  readonly emailVerificationCodeHash: string | null;
  readonly emailVerificationExpiresAt: Date | null;
  readonly twoFactorCodeHash: string | null;
  readonly twoFactorExpiresAt: Date | null;
  readonly passwordResetCodeHash: string | null;
  readonly passwordResetExpiresAt: Date | null;
  readonly registrationIpAddress: string | null;
  readonly registrationCountryCode: string | null;
  readonly registrationCountryName: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type CreateUserInput = {
  readonly fullName: string;
  readonly username: string;
  readonly email: string;
  readonly receiveNewsUpdates: boolean;
  readonly newsletterSubscribed: boolean;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly emailVerified: boolean;
  readonly emailVerificationCodeHash?: string | null;
  readonly emailVerificationExpiresAt?: Date | null;
  readonly twoFactorCodeHash?: string | null;
  readonly twoFactorExpiresAt?: Date | null;
  readonly passwordResetCodeHash?: string | null;
  readonly passwordResetExpiresAt?: Date | null;
  readonly registrationIpAddress?: string | null;
  readonly registrationCountryCode?: string | null;
  readonly registrationCountryName?: string | null;
};

export type UpdateUserInput = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;

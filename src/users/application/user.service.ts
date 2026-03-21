import bcrypt from "bcryptjs";
import { AutoWired, Service } from "@xtaskjs/core";
import { AppConfig } from "../../shared/infrastructure/config/app-config";
import { USER_LOGIN_EVENT_REPOSITORY, USER_REPOSITORY } from "../../shared/infrastructure/config/app-tokens";
import type { AccessLocationSnapshot } from "../domain/access-location";
import type { UserLoginEvent } from "../domain/user-login-event";
import type { UserLoginEventRepository } from "../domain/user-login-event.repository";
import type { User, UserRole } from "../domain/user";
import type { UserPage, UserRepository } from "../domain/user.repository";

export type SessionPrincipal = {
  readonly sub: string;
  readonly id: number;
  readonly fullName: string;
  readonly username: string;
  readonly email: string;
  readonly role: UserRole;
  readonly roles: string[];
};

export type RegisterUserCommand = {
  readonly fullName: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly receiveNewsUpdates: boolean;
  readonly newsletterSubscribed: boolean;
};

export type PendingSecurityCode = {
  readonly hash: string;
  readonly expiresAt: Date;
};

export type UsersAdminQuery = {
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
};

const normalizeIdentity = (value: string): string => value.trim().toLowerCase();

@Service()
export class UserService {
  @AutoWired({ qualifier: USER_REPOSITORY })
  private readonly repository!: UserRepository;

  @AutoWired({ qualifier: USER_LOGIN_EVENT_REPOSITORY })
  private readonly loginEventRepository!: UserLoginEventRepository;

  private readonly config = AppConfig;

  async ensureAdminAccount(): Promise<void> {
    const username = normalizeIdentity(this.config.admin.username);
    const email = normalizeIdentity(this.config.admin.email);
    const passwordHash = await this.resolveAdminPasswordHash();
    const existing = await this.repository.findByUsername(username);

    if (!existing) {
      await this.repository.create({
        fullName: "Administrator",
        username,
        email,
        receiveNewsUpdates: false,
        newsletterSubscribed: false,
        passwordHash,
        role: "admin",
        isActive: true,
        emailVerified: true,
      });
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
      await this.repository.update(existing.id, updates);
    }
  }

  async register(
    command: RegisterUserCommand,
    verificationCode: PendingSecurityCode,
    accessLocation?: AccessLocationSnapshot
  ): Promise<User> {
    const username = normalizeIdentity(command.username);
    const email = normalizeIdentity(command.email);

    await this.ensureUsernameAvailable(username);
    await this.ensureEmailAvailable(email);

    return this.repository.create({
      fullName: command.fullName.trim(),
      username,
      email,
      receiveNewsUpdates: command.receiveNewsUpdates,
      newsletterSubscribed: command.newsletterSubscribed,
      passwordHash: await bcrypt.hash(command.password, 10),
      role: "user",
      isActive: true,
      emailVerified: false,
      emailVerificationCodeHash: verificationCode.hash,
      emailVerificationExpiresAt: verificationCode.expiresAt,
      twoFactorCodeHash: null,
      twoFactorExpiresAt: null,
      passwordResetCodeHash: null,
      passwordResetExpiresAt: null,
      registrationIpAddress: accessLocation?.ipAddress ?? null,
      registrationCountryCode: accessLocation?.countryCode ?? null,
      registrationCountryName: accessLocation?.countryName ?? null,
    });
  }

  async recordLoginEvent(userId: number, accessLocation: AccessLocationSnapshot): Promise<void> {
    await this.loginEventRepository.create({
      userId,
      ipAddress: accessLocation.ipAddress,
      countryCode: accessLocation.countryCode,
      countryName: accessLocation.countryName,
      region: accessLocation.region,
      city: accessLocation.city,
      locationLabel: accessLocation.locationLabel,
      userAgent: accessLocation.userAgent,
    });
  }

  async getRecentLoginEventsByUserIds(
    userIds: readonly number[],
    limitPerUser: number = 3
  ): Promise<Record<number, UserLoginEvent[]>> {
    const events = await this.loginEventRepository.findRecentByUserIds(userIds, limitPerUser);
    return events.reduce<Record<number, UserLoginEvent[]>>((accumulator, event) => {
      const current = accumulator[event.userId] || [];
      current.push(event);
      accumulator[event.userId] = current;
      return accumulator;
    }, {});
  }

  async getLoginHistoryPage(
    userId: number,
    page: number,
    pageSize: number
  ): Promise<{ items: UserLoginEvent[]; total: number; totalPages: number }> {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.loginEventRepository.findByUserId(userId, { skip, take: pageSize }),
      this.loginEventRepository.countByUserId(userId),
    ]);

    return {
      items,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async authenticate(identifier: string, password: string): Promise<SessionPrincipal | null> {
    const user = await this.validateCredentials(identifier, password);
    if (!user || !user.emailVerified) {
      return null;
    }

    return this.toPrincipal(user);
  }

  async validateCredentials(identifier: string, password: string): Promise<User | null> {
    const user = await this.repository.findByIdentifier(normalizeIdentity(identifier));
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async resolvePrincipalById(id: number): Promise<SessionPrincipal | null> {
    const user = await this.repository.findById(id);
    if (!user || !user.isActive) {
      return null;
    }

    return this.toPrincipal(user);
  }

  async getById(id: number): Promise<User | null> {
    return this.repository.findById(id);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(normalizeIdentity(email));
  }

  async getByIdentifier(identifier: string): Promise<User | null> {
    return this.repository.findByIdentifier(normalizeIdentity(identifier));
  }

  async getAdminPage(query: UsersAdminQuery): Promise<UserPage & { totalPages: number }> {
    const skip = (query.page - 1) * query.pageSize;
    const page = await this.repository.findList({
      search: query.search || undefined,
      skip,
      take: query.pageSize,
    });

    return {
      ...page,
      totalPages: Math.ceil(page.total / query.pageSize),
    };
  }

  async updateRole(targetUserId: number, role: UserRole, actorUserId: number): Promise<void> {
    const target = await this.repository.findById(targetUserId);
    if (!target) {
      throw new Error("User not found");
    }

    if (target.id === actorUserId && target.role === "admin" && role !== "admin") {
      throw new Error("You cannot remove your own administrator role");
    }

    if (target.role === role) {
      return;
    }

    if (target.role === "admin" && role !== "admin") {
      const activeAdmins = await this.repository.countByRole("admin");
      if (activeAdmins <= 1) {
        throw new Error("At least one active administrator must remain");
      }
    }

    await this.repository.update(targetUserId, { role });
  }

  async updateActiveState(targetUserId: number, isActive: boolean, actorUserId: number): Promise<void> {
    const target = await this.repository.findById(targetUserId);
    if (!target) {
      throw new Error("User not found");
    }

    if (target.id === actorUserId && !isActive) {
      throw new Error("You cannot deactivate your own account");
    }

    if (target.role === "admin" && !isActive) {
      const activeAdmins = await this.repository.countByRole("admin");
      if (target.isActive && activeAdmins <= 1) {
        throw new Error("At least one active administrator must remain");
      }
    }

    if (target.isActive === isActive) {
      return;
    }

    await this.repository.update(targetUserId, { isActive });
  }

  async updateNewsletterSubscription(userId: number, newsletterSubscribed: boolean): Promise<User> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.newsletterSubscribed === newsletterSubscribed) {
      return user;
    }

    return this.repository.update(userId, { newsletterSubscribed });
  }

  async ensureUsernameAvailable(username: string): Promise<void> {
    const existing = await this.repository.findByUsername(username);
    if (existing) {
      throw new Error("That username is already in use");
    }
  }

  async ensureEmailAvailable(email: string): Promise<void> {
    const existing = await this.repository.findByEmail(email);
    if (existing) {
      throw new Error("That email address is already registered");
    }
  }

  async storeEmailVerificationCode(userId: number, code: PendingSecurityCode): Promise<User> {
    return this.repository.update(userId, {
      emailVerificationCodeHash: code.hash,
      emailVerificationExpiresAt: code.expiresAt,
    });
  }

  async markEmailVerified(userId: number): Promise<User> {
    return this.repository.update(userId, {
      emailVerified: true,
      emailVerificationCodeHash: null,
      emailVerificationExpiresAt: null,
    });
  }

  async storeTwoFactorCode(userId: number, code: PendingSecurityCode): Promise<User> {
    return this.repository.update(userId, {
      twoFactorCodeHash: code.hash,
      twoFactorExpiresAt: code.expiresAt,
    });
  }

  async clearTwoFactorCode(userId: number): Promise<User> {
    return this.repository.update(userId, {
      twoFactorCodeHash: null,
      twoFactorExpiresAt: null,
    });
  }

  async storePasswordResetCode(userId: number, code: PendingSecurityCode): Promise<User> {
    return this.repository.update(userId, {
      passwordResetCodeHash: code.hash,
      passwordResetExpiresAt: code.expiresAt,
    });
  }

  async setPassword(userId: number, password: string): Promise<User> {
    return this.repository.update(userId, {
      passwordHash: await bcrypt.hash(password, 10),
      passwordResetCodeHash: null,
      passwordResetExpiresAt: null,
      twoFactorCodeHash: null,
      twoFactorExpiresAt: null,
    });
  }

  async clearPasswordResetCode(userId: number): Promise<User> {
    return this.repository.update(userId, {
      passwordResetCodeHash: null,
      passwordResetExpiresAt: null,
    });
  }

  private toPrincipal(user: User): SessionPrincipal {
    return {
      sub: String(user.id),
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      roles: [user.role],
    };
  }

  private async resolveAdminPasswordHash(): Promise<string> {
    if (this.config.admin.passwordHash) {
      return this.config.admin.passwordHash;
    }

    return bcrypt.hash(this.config.admin.password, 10);
  }
}

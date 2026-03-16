import { Service } from "@xtaskjs/core";
import { DataSource } from "typeorm";
import type { CreateUserInput, UpdateUserInput, User, UserRole } from "../../domain/user";
import type { UserListOptions, UserPage, UserRepository } from "../../domain/user.repository";
import { USER_REPOSITORY } from "../../../shared/infrastructure/config/app-tokens";
import { getAppDataSource } from "../../../data-source";

type UserRow = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  email_verification_code_hash: string | null;
  email_verification_expires_at: Date | null;
  two_factor_code_hash: string | null;
  two_factor_expires_at: Date | null;
  password_reset_code_hash: string | null;
  password_reset_expires_at: Date | null;
  registration_ip_address: string | null;
  registration_country_code: string | null;
  registration_country_name: string | null;
  created_at: Date;
  updated_at: Date;
};

const mapUserRow = (row: UserRow): User => ({
  id: Number(row.id),
  fullName: row.full_name,
  username: row.username,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  isActive: Boolean(row.is_active),
  emailVerified: Boolean(row.email_verified),
  emailVerificationCodeHash: row.email_verification_code_hash,
  emailVerificationExpiresAt: row.email_verification_expires_at ? new Date(row.email_verification_expires_at) : null,
  twoFactorCodeHash: row.two_factor_code_hash,
  twoFactorExpiresAt: row.two_factor_expires_at ? new Date(row.two_factor_expires_at) : null,
  passwordResetCodeHash: row.password_reset_code_hash,
  passwordResetExpiresAt: row.password_reset_expires_at ? new Date(row.password_reset_expires_at) : null,
  registrationIpAddress: row.registration_ip_address,
  registrationCountryCode: row.registration_country_code,
  registrationCountryName: row.registration_country_name,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const resolveReturningRow = (result: unknown): UserRow | null => {
  if (Array.isArray(result)) {
    const [first] = result;
    if (Array.isArray(first)) {
      return (first[0] as UserRow | undefined) || null;
    }

    return (first as UserRow | undefined) || null;
  }

  return (result as UserRow | null) || null;
};

const userSelect = `
  SELECT
    id,
    full_name,
    username,
    email,
    password_hash,
    role,
    is_active,
    email_verified,
    email_verification_code_hash,
    email_verification_expires_at,
    two_factor_code_hash,
    two_factor_expires_at,
    password_reset_code_hash,
    password_reset_expires_at,
    registration_ip_address,
    registration_country_code,
    registration_country_name,
    created_at,
    updated_at
  FROM users
`;

@Service({ name: USER_REPOSITORY })
export class UserTypeOrmRepository implements UserRepository {
  private readonly dataSource: DataSource = getAppDataSource();

  async findById(id: number): Promise<User | null> {
    const rows = await this.dataSource.query(
      `
        ${userSelect}
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    return rows[0] ? mapUserRow(rows[0] as UserRow) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const rows = await this.dataSource.query(
      `
        ${userSelect}
        WHERE username = $1
        LIMIT 1
      `,
      [username]
    );

    return rows[0] ? mapUserRow(rows[0] as UserRow) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.dataSource.query(
      `
        ${userSelect}
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    return rows[0] ? mapUserRow(rows[0] as UserRow) : null;
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const rows = await this.dataSource.query(
      `
        ${userSelect}
        WHERE username = $1 OR email = $1
        LIMIT 1
      `,
      [identifier]
    );

    return rows[0] ? mapUserRow(rows[0] as UserRow) : null;
  }

  async findList(options: UserListOptions): Promise<UserPage> {
    const { search, skip, take } = options;

    const params: Array<string | number> = [];
    let whereClause = "";

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE full_name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1`;
    }

    const countRows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM users ${whereClause}`,
      params
    );

    const listParams = [...params];
    let paginationClause = "";
    if (take !== undefined) {
      listParams.push(take);
      paginationClause += ` LIMIT $${listParams.length}`;
    }
    if (skip !== undefined) {
      listParams.push(skip);
      paginationClause += ` OFFSET $${listParams.length}`;
    }

    const rows = await this.dataSource.query(
      `
        ${userSelect}
        ${whereClause}
        ORDER BY created_at DESC
        ${paginationClause}
      `,
      listParams
    );

    return {
      items: rows.map((row: UserRow) => mapUserRow(row)),
      total: Number(countRows[0]?.total || 0),
    };
  }

  async countByRole(role: UserRole): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM users WHERE role = $1 AND is_active = true`,
      [role]
    );

    return Number(rows[0]?.total || 0);
  }

  async create(input: CreateUserInput): Promise<User> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO users (
          full_name,
          username,
          email,
          password_hash,
          role,
          is_active,
          email_verified,
          email_verification_code_hash,
          email_verification_expires_at,
          two_factor_code_hash,
          two_factor_expires_at,
          password_reset_code_hash,
          password_reset_expires_at,
          registration_ip_address,
          registration_country_code,
          registration_country_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING
          id,
          full_name,
          username,
          email,
          password_hash,
          role,
          is_active,
          email_verified,
          email_verification_code_hash,
          email_verification_expires_at,
          two_factor_code_hash,
          two_factor_expires_at,
          password_reset_code_hash,
          password_reset_expires_at,
            registration_ip_address,
            registration_country_code,
            registration_country_name,
          created_at,
          updated_at
      `,
      [
        input.fullName,
        input.username,
        input.email,
        input.passwordHash,
        input.role,
        input.isActive,
        input.emailVerified,
        input.emailVerificationCodeHash ?? null,
        input.emailVerificationExpiresAt ?? null,
        input.twoFactorCodeHash ?? null,
        input.twoFactorExpiresAt ?? null,
        input.passwordResetCodeHash ?? null,
        input.passwordResetExpiresAt ?? null,
        input.registrationIpAddress ?? null,
        input.registrationCountryCode ?? null,
        input.registrationCountryName ?? null,
      ]
    );

    const row = resolveReturningRow(rows);
    if (!row) {
      throw new Error("User insert did not return a row");
    }

    return mapUserRow(row);
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const assignments: string[] = [];
    const values: Array<string | number | boolean | Date | null> = [];

    const pushAssignment = (column: string, value: string | number | boolean | Date | null): void => {
      values.push(value);
      assignments.push(`${column} = $${values.length}`);
    };

    if (input.fullName !== undefined) {
      pushAssignment("full_name", input.fullName);
    }
    if (input.username !== undefined) {
      pushAssignment("username", input.username);
    }
    if (input.email !== undefined) {
      pushAssignment("email", input.email);
    }
    if (input.passwordHash !== undefined) {
      pushAssignment("password_hash", input.passwordHash);
    }
    if (input.role !== undefined) {
      pushAssignment("role", input.role);
    }
    if (input.isActive !== undefined) {
      pushAssignment("is_active", input.isActive);
    }
    if (input.emailVerified !== undefined) {
      pushAssignment("email_verified", input.emailVerified);
    }
    if (input.emailVerificationCodeHash !== undefined) {
      pushAssignment("email_verification_code_hash", input.emailVerificationCodeHash);
    }
    if (input.emailVerificationExpiresAt !== undefined) {
      pushAssignment("email_verification_expires_at", input.emailVerificationExpiresAt);
    }
    if (input.twoFactorCodeHash !== undefined) {
      pushAssignment("two_factor_code_hash", input.twoFactorCodeHash);
    }
    if (input.twoFactorExpiresAt !== undefined) {
      pushAssignment("two_factor_expires_at", input.twoFactorExpiresAt);
    }
    if (input.passwordResetCodeHash !== undefined) {
      pushAssignment("password_reset_code_hash", input.passwordResetCodeHash);
    }
    if (input.passwordResetExpiresAt !== undefined) {
      pushAssignment("password_reset_expires_at", input.passwordResetExpiresAt);
    }
    if (input.registrationIpAddress !== undefined) {
      pushAssignment("registration_ip_address", input.registrationIpAddress);
    }
    if (input.registrationCountryCode !== undefined) {
      pushAssignment("registration_country_code", input.registrationCountryCode);
    }
    if (input.registrationCountryName !== undefined) {
      pushAssignment("registration_country_name", input.registrationCountryName);
    }

    assignments.push("updated_at = NOW()");
    values.push(id);

    const rows = await this.dataSource.query(
      `
        UPDATE users
        SET ${assignments.join(", ")}
        WHERE id = $${values.length}
        RETURNING
          id,
          full_name,
          username,
          email,
          password_hash,
          role,
          is_active,
          email_verified,
          email_verification_code_hash,
          email_verification_expires_at,
          two_factor_code_hash,
          two_factor_expires_at,
          password_reset_code_hash,
          password_reset_expires_at,
            registration_ip_address,
            registration_country_code,
            registration_country_name,
          created_at,
          updated_at
      `,
      values
    );

    const row = resolveReturningRow(rows);
    if (!row) {
      throw new Error(`User ${id} disappeared during update`);
    }

    return mapUserRow(row);
  }
}

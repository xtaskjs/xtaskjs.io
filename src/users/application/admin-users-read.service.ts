import { Cacheable } from "@xtaskjs/cache";
import { InjectReadDataSource } from "@xtaskjs/cqrs";
import { Service } from "@xtaskjs/core";
import { DataSource } from "typeorm";
import { QueryPageNumber, QueryPageSize } from "../../shared/domain/value-objects/query-pagination";
import { AdminUsersQueryCacheModel } from "../../shared/infrastructure/cache/site-query-cache.models";
import type { UserLoginEvent } from "../domain/user-login-event";
import type { UserRole, User } from "../domain/user";
import type { AdminUserDetailResult, ListAdminUsersResult } from "./cqrs/admin-users.messages";

type UserRow = {
  id: number;
  full_name: string;
  username: string;
  email: string;
  receive_news_updates: boolean;
  newsletter_subscribed: boolean;
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

type UserLoginEventRow = {
  id: number;
  user_id: number;
  ip_address: string | null;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  location_label: string | null;
  user_agent: string | null;
  created_at: Date;
};

const userSelect = `
  SELECT
    id,
    full_name,
    username,
    email,
    receive_news_updates,
    newsletter_subscribed,
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

const mapUserRow = (row: UserRow): User => ({
  id: Number(row.id),
  fullName: row.full_name,
  username: row.username,
  email: row.email,
  receiveNewsUpdates: Boolean(row.receive_news_updates),
  newsletterSubscribed: Boolean(row.newsletter_subscribed),
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

const mapUserLoginEventRow = (row: UserLoginEventRow): UserLoginEvent => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  ipAddress: row.ip_address,
  countryCode: row.country_code,
  countryName: row.country_name,
  region: row.region,
  city: row.city,
  locationLabel: row.location_label,
  userAgent: row.user_agent,
  createdAt: new Date(row.created_at),
});

@Service()
export class AdminUsersReadService {
  @InjectReadDataSource()
  private readonly dataSource!: DataSource;

  @Cacheable({
    model: AdminUsersQueryCacheModel,
    key: (search: string, page: number, pageSize: number) =>
      `list:${search || "all"}:${QueryPageNumber.from(page).value}:${QueryPageSize.from(pageSize).value}`,
  })
  async listAdminUsers(search: string, page: number, pageSize: number): Promise<ListAdminUsersResult> {
    const currentPage = QueryPageNumber.from(page);
    const currentPageSize = QueryPageSize.from(pageSize);
    const skip = (currentPage.value - 1) * currentPageSize.value;
    const params: Array<string | number> = [];
    let whereClause = "";

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE full_name ILIKE $1 OR username ILIKE $1 OR email ILIKE $1`;
    }

    const [countRows, rows] = (await Promise.all([
      this.dataSource.query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, params),
      this.dataSource.query(
        `
          ${userSelect}
          ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${params.length + 1}
          OFFSET $${params.length + 2}
        `,
        [...params, currentPageSize.value, skip]
      ),
    ])) as [[{ total?: number }], UserRow[]];

    const items = rows.map((row: UserRow) => mapUserRow(row));
    const recentLoginEvents = await this.findRecentLoginEventsByUserIds(items.map((item: User) => item.id), 3);
    const total = Number(countRows[0]?.total || 0);

    return {
      items,
      total,
      totalPages: Math.ceil(total / currentPageSize.value),
      recentLoginEvents,
    };
  }

  @Cacheable({
    model: AdminUsersQueryCacheModel,
    key: (userId: number, page: number, pageSize: number) =>
      `detail:${userId}:${QueryPageNumber.from(page).value}:${QueryPageSize.from(pageSize).value}`,
  })
  async getAdminUserDetail(userId: number, page: number, pageSize: number): Promise<AdminUserDetailResult> {
    const currentPage = QueryPageNumber.from(page);
    const currentPageSize = QueryPageSize.from(pageSize);
    const userRows = await this.dataSource.query(
      `
        ${userSelect}
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    const user = userRows[0] ? mapUserRow(userRows[0] as UserRow) : null;
    if (!user) {
      throw new Error("User not found");
    }

    const skip = (currentPage.value - 1) * currentPageSize.value;
    const [items, total] = await Promise.all([
      this.findLoginHistoryByUserId(userId, skip, currentPageSize.value),
      this.countLoginHistoryByUserId(userId),
    ]);

    return {
      user,
      loginHistory: {
        items,
        total,
        totalPages: Math.ceil(total / currentPageSize.value),
      },
    };
  }

  private async findRecentLoginEventsByUserIds(
    userIds: readonly number[],
    limitPerUser: number
  ): Promise<Readonly<Record<number, readonly UserLoginEvent[]>>> {
    if (userIds.length === 0) {
      return {};
    }

    const rows = (await this.dataSource.query(
      `
        SELECT
          id,
          user_id,
          ip_address,
          country_code,
          country_name,
          region,
          city,
          location_label,
          user_agent,
          created_at
        FROM (
          SELECT
            id,
            user_id,
            ip_address,
            country_code,
            country_name,
            region,
            city,
            location_label,
            user_agent,
            created_at,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS row_number
          FROM user_login_events
          WHERE user_id = ANY($1)
        ) recent_events
        WHERE row_number <= $2
        ORDER BY user_id ASC, created_at DESC
      `,
      [userIds, limitPerUser]
    )) as UserLoginEventRow[];

    return rows.reduce((accumulator: Record<number, UserLoginEvent[]>, row: UserLoginEventRow) => {
      const event = mapUserLoginEventRow(row);
      const current = accumulator[event.userId] || [];
      current.push(event);
      accumulator[event.userId] = current;
      return accumulator;
    }, {});
  }

  private async findLoginHistoryByUserId(userId: number, skip: number, take: number): Promise<UserLoginEvent[]> {
    const rows = await this.dataSource.query(
      `
        SELECT
          id,
          user_id,
          ip_address,
          country_code,
          country_name,
          region,
          city,
          location_label,
          user_agent,
          created_at
        FROM user_login_events
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        OFFSET $3
      `,
      [userId, take, skip]
    );

    return rows.map((row: UserLoginEventRow) => mapUserLoginEventRow(row));
  }

  private async countLoginHistoryByUserId(userId: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM user_login_events WHERE user_id = $1`,
      [userId]
    );

    return Number(rows[0]?.total || 0);
  }
}
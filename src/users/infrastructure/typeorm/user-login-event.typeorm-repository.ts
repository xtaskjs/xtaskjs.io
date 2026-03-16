import { Service } from "@xtaskjs/core";
import { DataSource } from "typeorm";
import { getAppDataSource } from "../../../data-source";
import { USER_LOGIN_EVENT_REPOSITORY } from "../../../shared/infrastructure/config/app-tokens";
import type { CreateUserLoginEventInput, UserLoginEvent } from "../../domain/user-login-event";
import type { UserLoginEventRepository } from "../../domain/user-login-event.repository";

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

@Service({ name: USER_LOGIN_EVENT_REPOSITORY })
export class UserLoginEventTypeOrmRepository implements UserLoginEventRepository {
  private readonly dataSource: DataSource = getAppDataSource();
  private readonly selectClause = `
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
  `;

  async create(input: CreateUserLoginEventInput): Promise<UserLoginEvent> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO user_login_events (
          user_id,
          ip_address,
          country_code,
          country_name,
          region,
          city,
          location_label,
          user_agent
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
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
      `,
      [
        input.userId,
        input.ipAddress,
        input.countryCode,
        input.countryName,
        input.region,
        input.city,
        input.locationLabel,
        input.userAgent,
      ]
    );

    const row = rows[0] as UserLoginEventRow | undefined;
    if (!row) {
      throw new Error("User login event insert did not return a row");
    }

    return mapUserLoginEventRow(row);
  }

  async findRecentByUserIds(userIds: readonly number[], limitPerUser: number): Promise<UserLoginEvent[]> {
    if (userIds.length === 0 || limitPerUser <= 0) {
      return [];
    }

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
    );

    return rows.map((row: UserLoginEventRow) => mapUserLoginEventRow(row));
  }

  async findByUserId(userId: number, options: { skip?: number; take?: number } = {}): Promise<UserLoginEvent[]> {
    const values: number[] = [userId];
    let paginationClause = "";

    if (options.take !== undefined) {
      values.push(options.take);
      paginationClause += ` LIMIT $${values.length}`;
    }

    if (options.skip !== undefined) {
      values.push(options.skip);
      paginationClause += ` OFFSET $${values.length}`;
    }

    const rows = await this.dataSource.query(
      `
        ${this.selectClause}
        WHERE user_id = $1
        ORDER BY created_at DESC
        ${paginationClause}
      `,
      values
    );

    return rows.map((row: UserLoginEventRow) => mapUserLoginEventRow(row));
  }

  async countByUserId(userId: number): Promise<number> {
    const rows = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM user_login_events WHERE user_id = $1`,
      [userId]
    );

    return Number(rows[0]?.total || 0);
  }
}
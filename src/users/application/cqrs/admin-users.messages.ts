import type { UserLoginEvent } from "../../domain/user-login-event";
import type { UserRole } from "../../domain/user";
import type { UserPage } from "../../domain/user.repository";

export class ListAdminUsersQuery {
  constructor(
    public readonly search: string,
    public readonly page: number,
    public readonly pageSize: number
  ) {}
}

export type ListAdminUsersResult = UserPage & {
  readonly totalPages: number;
  readonly recentLoginEvents: Readonly<Record<number, readonly UserLoginEvent[]>>;
};

export type AdminUserDetailResult = {
  readonly user: import("../../domain/user").User;
  readonly loginHistory: {
    readonly items: readonly UserLoginEvent[];
    readonly total: number;
    readonly totalPages: number;
  };
};

export class GetAdminUserDetailQuery {
  constructor(
    public readonly userId: number,
    public readonly page: number,
    public readonly pageSize: number
  ) {}
}

export class UpdateUserRoleCommand {
  constructor(
    public readonly targetUserId: number,
    public readonly role: UserRole,
    public readonly actorUserId: number
  ) {}
}

export class UpdateUserStatusCommand {
  constructor(
    public readonly targetUserId: number,
    public readonly isActive: boolean,
    public readonly actorUserId: number
  ) {}
}
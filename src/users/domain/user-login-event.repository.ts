import type { CreateUserLoginEventInput, UserLoginEvent } from "./user-login-event";

export interface UserLoginEventRepository {
  create(input: CreateUserLoginEventInput): Promise<UserLoginEvent>;
  findRecentByUserIds(userIds: readonly number[], limitPerUser: number): Promise<UserLoginEvent[]>;
  findByUserId(userId: number, options?: { skip?: number; take?: number }): Promise<UserLoginEvent[]>;
  countByUserId(userId: number): Promise<number>;
}
import type { AccessLocationSnapshot } from "./access-location";

export type UserLoginEvent = {
  readonly id: number;
  readonly userId: number;
  readonly ipAddress: string | null;
  readonly countryCode: string | null;
  readonly countryName: string | null;
  readonly region: string | null;
  readonly city: string | null;
  readonly locationLabel: string | null;
  readonly userAgent: string | null;
  readonly createdAt: Date;
};

export type CreateUserLoginEventInput = {
  readonly userId: number;
} & AccessLocationSnapshot;
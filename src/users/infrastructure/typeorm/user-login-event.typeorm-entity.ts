import { EntitySchema } from "typeorm";
import type { UserLoginEvent } from "../../domain/user-login-event";

export const UserLoginEventTypeOrmEntity = new EntitySchema<UserLoginEvent>({
  name: "UserLoginEvent",
  tableName: "user_login_events",
  columns: {
    id: { type: Number, primary: true, generated: true },
    userId: { type: Number, name: "user_id" },
    ipAddress: { type: String, name: "ip_address", length: 64, nullable: true },
    countryCode: { type: String, name: "country_code", length: 8, nullable: true },
    countryName: { type: String, name: "country_name", length: 120, nullable: true },
    region: { type: String, length: 120, nullable: true },
    city: { type: String, length: 120, nullable: true },
    locationLabel: { type: String, name: "location_label", length: 255, nullable: true },
    userAgent: { type: String, name: "user_agent", length: 512, nullable: true },
    createdAt: { type: Date, name: "created_at", createDate: true },
  },
});
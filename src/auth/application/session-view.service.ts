import { Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import {
  InjectAuthenticationService,
  SecurityAuthenticationService,
} from "@xtaskjs/security";

export type ViewerViewModel = {
  readonly displayName: string;
  readonly username: string;
  readonly email: string;
  readonly role: string;
  readonly isAdmin: boolean;
  readonly accountHref: string;
  readonly accountLabel: string;
};

@Service()
export class SessionViewService {
  @InjectAuthenticationService()
  private readonly authentication!: SecurityAuthenticationService;

  async getViewer(req: Request, res: Response): Promise<ViewerViewModel | null> {
    const result = await this.authentication.authenticateRequest(req, res, "app-session");
    if (!result.success || !result.user) {
      return null;
    }

    const role = Array.isArray(result.roles) && result.roles.includes("admin") ? "admin" : "user";
    return {
      displayName: String(result.user.fullName || result.user.username || result.user.email || "Account"),
      username: String(result.user.username || ""),
      email: String(result.user.email || ""),
      role,
      isAdmin: role === "admin",
      accountHref: role === "admin" ? "/admin/users" : "/dashboard",
      accountLabel: role === "admin" ? "Admin Panel" : "Dashboard",
    };
  }
}

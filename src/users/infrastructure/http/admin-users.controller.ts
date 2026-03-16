import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Body, Controller, Get, Post, Query, Req, Res } from "@xtaskjs/common";
import { view } from "@xtaskjs/express-http";
import { Authenticated, Roles } from "@xtaskjs/security";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SessionViewService } from "../../../auth/application/session-view.service";
import { normalizeText } from "../../../shared/infrastructure/http/view-helpers";
import { UserService } from "../../application/user.service";
import type { UserLoginEvent } from "../../domain/user-login-event";
import type { User } from "../../domain/user";

type AuthenticatedRequest = Request & {
  user?: { id?: number };
};

const PAGE_SIZE = 10;
const LOGIN_HISTORY_PAGE_SIZE = 20;

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim() : value;

class AdminUsersListQueryDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  error?: string;
}

class AdminUserDetailQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;
}

class UpdateUserRoleBodyDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsIn(["admin", "user"])
  role!: "admin" | "user";
}

class UpdateUserStatusBodyDto {
  @IsInt()
  @Min(1)
  id!: number;

  @IsIn(["active", "inactive"])
  status!: "active" | "inactive";
}

const buildPages = (total: number, pageSize: number, currentPage: number) => {
  const totalPages = Math.ceil(total / pageSize);
  return {
    totalPages,
    pages: Array.from({ length: totalPages }, (_, index) => ({
      number: index + 1,
      isCurrent: index + 1 === currentPage,
    })),
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
    prevPage: currentPage - 1,
    nextPage: currentPage + 1,
  };
};

const toUserCard = (user: User, loginEvents: readonly UserLoginEvent[] = []) => ({
  id: user.id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  isAdminRole: user.role === "admin",
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  nextRole: user.role === "admin" ? "user" : "admin",
  nextStatus: user.isActive ? "inactive" : "active",
  registrationCountryName: user.registrationCountryName,
  registrationIpAddress: user.registrationIpAddress,
  hasRecentLogins: loginEvents.length > 0,
  recentLogins: loginEvents.map((event) => ({
    locationLabel: event.locationLabel,
    countryName: event.countryName,
    ipAddress: event.ipAddress,
    createdAt: event.createdAt,
  })),
  detailHref: `/admin/users/${user.id}`,
});

@Service()
@Controller("/admin/users")
@Authenticated("app-session")
@Roles("admin")
export class AdminUsersController {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  @AutoWired({ qualifier: SessionViewService.name })
  private readonly sessionViewService!: SessionViewService;

  @Get("/:id")
  async detail(
    @Query() query: AdminUserDetailQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view> | void> {
    const userId = Number(req.params.id || 0);
    if (!Number.isFinite(userId) || userId < 1) {
      res.redirect("/admin/users?error=Invalid%20user");
      return;
    }

    const user = await this.userService.getById(userId);
    if (!user) {
      res.redirect("/admin/users?error=User%20not%20found");
      return;
    }

    const page = Math.max(1, query.page ?? 1);
    const history = await this.userService.getLoginHistoryPage(user.id, page, LOGIN_HISTORY_PAGE_SIZE);
    const pagination = buildPages(history.total, LOGIN_HISTORY_PAGE_SIZE, page);

    return view("admin-user-detail", {
      titleKey: "admin.users.detail.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        registrationCountryName: user.registrationCountryName,
        registrationIpAddress: user.registrationIpAddress,
      },
      loginEvents: history.items.map((event) => ({
        locationLabel: event.locationLabel,
        countryName: event.countryName,
        region: event.region,
        city: event.city,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        createdAt: event.createdAt,
      })),
      totalEvents: history.total,
      hasLoginEvents: history.items.length > 0,
      basePath: `/admin/users/${user.id}`,
      ...pagination,
    });
  }

  @Get("/")
  async list(
    @Query() query: AdminUsersListQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ReturnType<typeof view>> {
    const search = normalizeText(query.q);
    const page = Math.max(1, query.page ?? 1);
    const result = await this.userService.getAdminPage({ search, page, pageSize: PAGE_SIZE });
    const pagination = buildPages(result.total, PAGE_SIZE, page);
    const recentLoginEvents = await this.userService.getRecentLoginEventsByUserIds(
      result.items.map((user) => user.id),
      3
    );

    return view("admin-users-list", {
      titleKey: "admin.users.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      users: result.items.map((user) => toUserCard(user, recentLoginEvents[user.id] || [])),
      message: query.message,
      error: query.error,
      search,
      total: result.total,
      ...pagination,
    });
  }

  @Post("/role")
  async updateRole(
    @Body() body: UpdateUserRoleBodyDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const actorId = Number(authenticatedRequest.user?.id || 0);

    try {
      await this.userService.updateRole(body.id, body.role, actorId);
      res.redirect("/admin/users?message=role-updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? encodeURIComponent(error.message) : "Unable to update role";
      res.redirect(`/admin/users?error=${message}`);
    }
  }

  @Post("/status")
  async updateStatus(
    @Body() body: UpdateUserStatusBodyDto,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const authenticatedRequest = req as AuthenticatedRequest;
    const actorId = Number(authenticatedRequest.user?.id || 0);
    const isActive = body.status === "active";

    try {
      await this.userService.updateActiveState(body.id, isActive, actorId);
      res.redirect("/admin/users?message=status-updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? encodeURIComponent(error.message) : "Unable to update status";
      res.redirect(`/admin/users?error=${message}`);
    }
  }
}

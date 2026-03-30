import { AutoWired, Service } from "@xtaskjs/core";
import type { Request, Response } from "express";
import { Body, Controller, Get, Post, Query, Req, Res } from "@xtaskjs/common";
import { CommandBus, InjectCommandBus, InjectQueryBus, QueryBus } from "@xtaskjs/cqrs";
import { view } from "@xtaskjs/express-http";
import { Authenticated, Roles } from "@xtaskjs/security";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SessionViewService } from "../../../auth/application/session-view.service";
import { normalizeText } from "../../../shared/infrastructure/http/view-helpers";
import {
  type AdminUserDetailResult,
  GetAdminUserDetailQuery,
  ListAdminUsersQuery,
  type ListAdminUsersResult,
  UpdateUserRoleCommand,
  UpdateUserStatusCommand,
} from "../../application/cqrs/admin-users.messages";
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
  @InjectQueryBus()
  private readonly queryBus!: QueryBus;

  @InjectCommandBus()
  private readonly commandBus!: CommandBus;

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

    const page = Math.max(1, query.page ?? 1);
    let result: AdminUserDetailResult;

    try {
      result = await this.queryBus.execute<AdminUserDetailResult>(
        new GetAdminUserDetailQuery(userId, page, LOGIN_HISTORY_PAGE_SIZE)
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? encodeURIComponent(error.message) : "User%20not%20found";
      res.redirect(`/admin/users?error=${message}`);
      return;
    }

    const pagination = buildPages(result.loginHistory.total, LOGIN_HISTORY_PAGE_SIZE, page);

    return view("admin-user-detail", {
      titleKey: "admin.users.detail.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        isActive: result.user.isActive,
        emailVerified: result.user.emailVerified,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
        registrationCountryName: result.user.registrationCountryName,
        registrationIpAddress: result.user.registrationIpAddress,
      },
      loginEvents: result.loginHistory.items.map((event) => ({
        locationLabel: event.locationLabel,
        countryName: event.countryName,
        region: event.region,
        city: event.city,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        createdAt: event.createdAt,
      })),
      totalEvents: result.loginHistory.total,
      hasLoginEvents: result.loginHistory.items.length > 0,
      basePath: `/admin/users/${result.user.id}`,
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
    const result = await this.queryBus.execute<ListAdminUsersResult>(
      new ListAdminUsersQuery(search, page, PAGE_SIZE)
    );
    const pagination = buildPages(result.total, PAGE_SIZE, page);

    return view("admin-users-list", {
      titleKey: "admin.users.metaTitle",
      viewer: await this.sessionViewService.getViewer(req, res),
      users: result.items.map((user) => toUserCard(user, result.recentLoginEvents[user.id] || [])),
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
      await this.commandBus.execute(new UpdateUserRoleCommand(body.id, body.role, actorId));
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
      await this.commandBus.execute(new UpdateUserStatusCommand(body.id, isActive, actorId));
      res.redirect("/admin/users?message=status-updated");
    } catch (error: unknown) {
      const message = error instanceof Error ? encodeURIComponent(error.message) : "Unable to update status";
      res.redirect(`/admin/users?error=${message}`);
    }
  }
}

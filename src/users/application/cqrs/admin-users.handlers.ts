import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@xtaskjs/cqrs";
import { AutoWired, Service } from "@xtaskjs/core";
import { UserService } from "../user.service";
import {
  type AdminUserDetailResult,
  GetAdminUserDetailQuery,
  ListAdminUsersQuery,
  type ListAdminUsersResult,
  UpdateUserRoleCommand,
  UpdateUserStatusCommand,
} from "./admin-users.messages";

@Service()
@QueryHandler(GetAdminUserDetailQuery)
export class GetAdminUserDetailHandler implements IQueryHandler<GetAdminUserDetailQuery, AdminUserDetailResult> {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  async execute(query: GetAdminUserDetailQuery): Promise<AdminUserDetailResult> {
    const user = await this.userService.getById(query.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const loginHistory = await this.userService.getLoginHistoryPage(query.userId, query.page, query.pageSize);

    return {
      user,
      loginHistory,
    };
  }
}

@Service()
@QueryHandler(ListAdminUsersQuery)
export class ListAdminUsersHandler implements IQueryHandler<ListAdminUsersQuery, ListAdminUsersResult> {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  async execute(query: ListAdminUsersQuery): Promise<ListAdminUsersResult> {
    const page = await this.userService.getAdminPage({
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    });
    const recentLoginEvents = await this.userService.getRecentLoginEventsByUserIds(
      page.items.map((user) => user.id),
      3
    );

    return {
      ...page,
      recentLoginEvents,
    };
  }
}

@Service()
@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler implements ICommandHandler<UpdateUserRoleCommand, void> {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  async execute(command: UpdateUserRoleCommand): Promise<void> {
    await this.userService.updateRole(command.targetUserId, command.role, command.actorUserId);
  }
}

@Service()
@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler implements ICommandHandler<UpdateUserStatusCommand, void> {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  async execute(command: UpdateUserStatusCommand): Promise<void> {
    await this.userService.updateActiveState(command.targetUserId, command.isActive, command.actorUserId);
  }
}
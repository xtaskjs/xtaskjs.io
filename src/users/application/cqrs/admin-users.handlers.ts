import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@xtaskjs/cqrs";
import { AutoWired, Service } from "@xtaskjs/core";
import { AdminUsersReadService } from "../admin-users-read.service";
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
  @AutoWired({ qualifier: AdminUsersReadService.name })
  private readonly adminUsersReadService!: AdminUsersReadService;

  async execute(query: GetAdminUserDetailQuery): Promise<AdminUserDetailResult> {
    return this.adminUsersReadService.getAdminUserDetail(query.userId, query.page, query.pageSize);
  }
}

@Service()
@QueryHandler(ListAdminUsersQuery)
export class ListAdminUsersHandler implements IQueryHandler<ListAdminUsersQuery, ListAdminUsersResult> {
  @AutoWired({ qualifier: AdminUsersReadService.name })
  private readonly adminUsersReadService!: AdminUsersReadService;

  async execute(query: ListAdminUsersQuery): Promise<ListAdminUsersResult> {
    return this.adminUsersReadService.listAdminUsers(query.search, query.page, query.pageSize);
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
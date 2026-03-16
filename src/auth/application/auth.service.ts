import { AutoWired, Service } from "@xtaskjs/core";
import { UserService, type SessionPrincipal } from "../../users/application/user.service";

@Service()
export class AuthService {
  @AutoWired({ qualifier: UserService.name })
  private readonly userService!: UserService;

  async authenticate(identifier: string, password: string): Promise<SessionPrincipal | null> {
    return this.userService.authenticate(identifier, password);
  }

  async resolvePrincipalById(id: number): Promise<SessionPrincipal | null> {
    return this.userService.resolvePrincipalById(id);
  }
}

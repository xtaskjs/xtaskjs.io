import { CommandHandler, ICommandHandler } from "@xtaskjs/cqrs";
import { Service, getCurrentContainer } from "@xtaskjs/core";
import { AccountAccessService } from "../account-access.service";
import { RegisterAccountCommand, type RegisterAccountResult } from "./account-registration.messages";

@Service()
@CommandHandler(RegisterAccountCommand)
export class RegisterAccountHandler implements ICommandHandler<RegisterAccountCommand, RegisterAccountResult> {
  private resolveAccountAccessService(): AccountAccessService {
    const container = getCurrentContainer();
    if (!container) {
      throw new Error("CQRS registration command requires an active xtaskjs container");
    }

    return container.get(AccountAccessService);
  }

  async execute(command: RegisterAccountCommand): Promise<RegisterAccountResult> {
    return this.resolveAccountAccessService().register(
      {
        fullName: command.fullName,
        username: command.username,
        email: command.email,
        password: command.password,
        receiveNewsUpdates: command.receiveNewsUpdates,
        newsletterSubscribed: command.newsletterSubscribed,
      },
      command.accessLocation
    );
  }
}
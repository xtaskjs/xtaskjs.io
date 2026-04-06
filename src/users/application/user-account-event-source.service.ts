import { EventSourceRepository, getEventSourceRepositoryToken } from "@xtaskjs/event-source";
import { Service, getCurrentContainer } from "@xtaskjs/core";
import type { AccessLocationSnapshot } from "../domain/access-location";
import type { User } from "../domain/user";
import { UserAccountAggregate } from "../domain/user-account.aggregate";

@Service()
export class UserAccountEventSourceService {
  private resolveRepository(): EventSourceRepository<UserAccountAggregate> | null {
    const container = getCurrentContainer();

    if (!container) {
      return null;
    }

    try {
      return container.getByName<EventSourceRepository<UserAccountAggregate>>(
        getEventSourceRepositoryToken(UserAccountAggregate)
      );
    } catch {
      return null;
    }
  }

  async recordUserRegistered(user: Pick<User, "id" | "username" | "email" | "emailVerified">): Promise<void> {
    const aggregate = await this.loadOrSeed(user);
    await this.saveIfDirty(aggregate);
  }

  async recordEmailVerificationCodeIssued(
    user: Pick<User, "id" | "username" | "email" | "emailVerified">,
    expiresAt: Date
  ): Promise<void> {
    const aggregate = await this.loadOrSeed(user);
    aggregate.issueEmailVerificationCode(user.id, expiresAt);
    await this.saveIfDirty(aggregate);
  }

  async recordEmailVerified(user: Pick<User, "id" | "username" | "email" | "emailVerified">): Promise<void> {
    const aggregate = await this.loadOrSeed(user);
    aggregate.markEmailVerified(user.id);
    await this.saveIfDirty(aggregate);
  }

  async recordPasswordResetRequested(
    user: Pick<User, "id" | "username" | "email" | "emailVerified">,
    expiresAt: Date
  ): Promise<void> {
    const aggregate = await this.loadOrSeed(user);
    aggregate.requestPasswordReset(user.id, expiresAt);
    await this.saveIfDirty(aggregate);
  }

  async recordPasswordResetCompleted(user: Pick<User, "id" | "username" | "email" | "emailVerified">): Promise<void> {
    const aggregate = await this.loadOrSeed(user);
    aggregate.completePasswordReset(user.id);
    await this.saveIfDirty(aggregate);
  }

  async recordLoginCompleted(userId: number, accessLocation: AccessLocationSnapshot): Promise<void> {
    const repository = this.resolveRepository();
    if (!repository) {
      return;
    }

    const aggregate = await repository.loadOrCreate(String(userId));
    aggregate.recordLogin(userId, accessLocation.ipAddress, accessLocation.locationLabel, accessLocation.userAgent);
    await this.saveIfDirty(aggregate);
  }

  private async loadOrSeed(user: Pick<User, "id" | "username" | "email" | "emailVerified">): Promise<UserAccountAggregate> {
    const repository = this.resolveRepository();
    if (!repository) {
      return new UserAccountAggregate();
    }

    const aggregate = await repository.loadOrCreate(String(user.id));
    const snapshot = aggregate.snapshot();

    if (!snapshot.registered) {
      aggregate.register(user.id, user.username, user.email);
      if (user.emailVerified) {
        aggregate.markEmailVerified(user.id);
      }
    }

    return aggregate;
  }

  private async saveIfDirty(aggregate: UserAccountAggregate): Promise<void> {
    if (aggregate.getUncommittedEvents().length === 0) {
      return;
    }

    const repository = this.resolveRepository();
    if (!repository) {
      return;
    }

    await repository.save(aggregate);
  }
}
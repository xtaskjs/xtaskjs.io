import { ApplyEvent, EventSourcedAggregate, EventSourcedAggregateRoot } from "@xtaskjs/event-source";
import {
  UserEmailVerificationCodeIssuedEvent,
  UserEmailVerifiedEvent,
  UserLoginCompletedEvent,
  UserPasswordResetCompletedEvent,
  UserPasswordResetRequestedEvent,
  UserRegisteredEvent,
} from "./user-account.events";

@EventSourcedAggregate({ stream: "user-accounts" })
export class UserAccountAggregate extends EventSourcedAggregateRoot {
  private registered = false;
  private userId?: number;
  private username?: string;
  private email?: string;
  private emailVerified = false;
  private loginCount = 0;
  private lastLoginAt?: string;
  private passwordResetRequestedAt?: string;
  private passwordResetCompletedAt?: string;

  register(userId: number, username: string, email: string): void {
    if (this.registered) {
      return;
    }

    this.assignStreamId(String(userId));
    this.raiseEvent(new UserRegisteredEvent(userId, username, email));
  }

  issueEmailVerificationCode(userId: number, expiresAt: Date): void {
    this.raiseEvent(new UserEmailVerificationCodeIssuedEvent(userId, expiresAt.toISOString()));
  }

  markEmailVerified(userId: number): void {
    if (this.emailVerified) {
      return;
    }

    this.raiseEvent(new UserEmailVerifiedEvent(userId));
  }

  requestPasswordReset(userId: number, expiresAt: Date): void {
    this.raiseEvent(new UserPasswordResetRequestedEvent(userId, expiresAt.toISOString()));
  }

  completePasswordReset(userId: number): void {
    this.raiseEvent(new UserPasswordResetCompletedEvent(userId));
  }

  recordLogin(userId: number, ipAddress: string | null, locationLabel: string | null, userAgent: string | null): void {
    this.raiseEvent(new UserLoginCompletedEvent(userId, ipAddress, locationLabel, userAgent));
  }

  snapshot(): {
    readonly registered: boolean;
    readonly userId?: number;
    readonly username?: string;
    readonly email?: string;
    readonly emailVerified: boolean;
    readonly loginCount: number;
    readonly lastLoginAt?: string;
    readonly passwordResetRequestedAt?: string;
    readonly passwordResetCompletedAt?: string;
  } {
    return {
      registered: this.registered,
      userId: this.userId,
      username: this.username,
      email: this.email,
      emailVerified: this.emailVerified,
      loginCount: this.loginCount,
      lastLoginAt: this.lastLoginAt,
      passwordResetRequestedAt: this.passwordResetRequestedAt,
      passwordResetCompletedAt: this.passwordResetCompletedAt,
    };
  }

  @ApplyEvent(UserRegisteredEvent)
  onRegistered(event: UserRegisteredEvent): void {
    this.registered = true;
    this.userId = event.userId;
    this.username = event.username;
    this.email = event.email;
  }

  @ApplyEvent(UserEmailVerificationCodeIssuedEvent)
  onEmailVerificationCodeIssued(): void {}

  @ApplyEvent(UserEmailVerifiedEvent)
  onEmailVerified(): void {
    this.emailVerified = true;
  }

  @ApplyEvent(UserPasswordResetRequestedEvent)
  onPasswordResetRequested(event: UserPasswordResetRequestedEvent): void {
    this.passwordResetRequestedAt = event.occurredAt;
  }

  @ApplyEvent(UserPasswordResetCompletedEvent)
  onPasswordResetCompleted(event: UserPasswordResetCompletedEvent): void {
    this.passwordResetCompletedAt = event.occurredAt;
  }

  @ApplyEvent(UserLoginCompletedEvent)
  onLoginCompleted(event: UserLoginCompletedEvent): void {
    this.loginCount += 1;
    this.lastLoginAt = event.occurredAt;
  }
}
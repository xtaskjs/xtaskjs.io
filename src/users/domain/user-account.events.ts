export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly email: string,
    public readonly occurredAt: string = new Date().toISOString()
  ) {}
}

export class UserEmailVerificationCodeIssuedEvent {
  constructor(
    public readonly userId: number,
    public readonly expiresAt: string,
    public readonly occurredAt: string = new Date().toISOString()
  ) {}
}

export class UserEmailVerifiedEvent {
  constructor(
    public readonly userId: number,
    public readonly occurredAt: string = new Date().toISOString()
  ) {}
}

export class UserPasswordResetRequestedEvent {
  constructor(
    public readonly userId: number,
    public readonly expiresAt: string,
    public readonly occurredAt: string = new Date().toISOString()
  ) {}
}

export class UserPasswordResetCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly occurredAt: string = new Date().toISOString()
  ) {}
}

export class UserLoginCompletedEvent {
  constructor(
    public readonly userId: number,
    public readonly ipAddress: string | null,
    public readonly locationLabel: string | null,
    public readonly userAgent: string | null,
    public readonly occurredAt: string = new Date().toISOString()
  ) {}
}
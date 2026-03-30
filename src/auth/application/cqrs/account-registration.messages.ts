import type { AccessLocationSnapshot } from "../../../users/domain/access-location";

export type RegisterAccountResult = {
  readonly email: string;
  readonly expiresAt: Date;
};

export class RegisterAccountCommand {
  constructor(
    public readonly fullName: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly receiveNewsUpdates: boolean,
    public readonly newsletterSubscribed: boolean,
    public readonly accessLocation?: AccessLocationSnapshot
  ) {}
}
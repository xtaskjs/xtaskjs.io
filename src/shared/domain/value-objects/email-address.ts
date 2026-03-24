import {
  InjectableValueObjectFactory,
  StringValueObject,
  ValueObjectFactoryFor,
} from "@xtaskjs/value-objects";

const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmailAddress = (value: string): string => value.trim().toLowerCase();

export class EmailAddress extends StringValueObject {
  constructor(value: string) {
    const normalized = normalizeEmailAddress(value);
    if (!EMAIL_ADDRESS_PATTERN.test(normalized)) {
      throw new Error("Invalid email address");
    }

    super(normalized);
  }
}

@ValueObjectFactoryFor(EmailAddress)
export class EmailAddressFactory extends InjectableValueObjectFactory<EmailAddress> {}
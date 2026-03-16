import type { CreateUserInput, UpdateUserInput, User, UserRole } from "./user";

export type UserListOptions = {
  readonly search?: string;
  readonly skip?: number;
  readonly take?: number;
};

export type UserPage = {
  readonly items: User[];
  readonly total: number;
};

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByIdentifier(identifier: string): Promise<User | null>;
  findList(options: UserListOptions): Promise<UserPage>;
  countByRole(role: UserRole): Promise<number>;
  create(input: CreateUserInput): Promise<User>;
  update(id: number, input: UpdateUserInput): Promise<User>;
}

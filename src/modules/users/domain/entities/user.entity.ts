export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): User {
    return new User(
      undefined as any, // ID será generado por la base de datos
      email,
      password,
      firstName,
      lastName,
      true,
      new Date(),
      new Date(),
    );
  }

  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  isActiveUser(): boolean {
    return this.isActive;
  }
}

import { IQuery } from '@nestjs/cqrs';

export class GetUserOrdersQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}

import { IQuery } from '@nestjs/cqrs';

export class GetAllProductsQuery implements IQuery {
  constructor(
    public readonly includeInactive: boolean = false,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}

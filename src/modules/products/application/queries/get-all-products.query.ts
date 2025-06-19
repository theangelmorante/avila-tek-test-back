import { IQuery } from '@nestjs/cqrs';

export class GetAllProductsQuery implements IQuery {
  constructor(public readonly includeInactive: boolean = false) {}
}

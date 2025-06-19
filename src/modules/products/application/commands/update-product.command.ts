import { ICommand } from '@nestjs/cqrs';

export class UpdateProductCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string | null,
    public readonly price?: number,
    public readonly stock?: number,
    public readonly isActive?: boolean,
  ) {}
}

import { ICommand } from '@nestjs/cqrs';

export class CreateProductCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly stock: number,
  ) {}
}

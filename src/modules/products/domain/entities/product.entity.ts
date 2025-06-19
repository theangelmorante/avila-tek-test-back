export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly stock: number,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    name: string,
    description: string | null,
    price: number,
    stock: number,
  ): Product {
    return new Product(
      undefined as any, // ID será generado por la base de datos
      name,
      description,
      price,
      stock,
      true,
      new Date(),
      new Date(),
    );
  }

  isAvailable(): boolean {
    return this.isActive && this.stock > 0;
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  updateStock(newStock: number): Product {
    return new Product(
      this.id,
      this.name,
      this.description,
      this.price,
      newStock,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  update(
    name?: string,
    description?: string | null,
    price?: number,
    stock?: number,
    isActive?: boolean,
  ): Product {
    return new Product(
      this.id,
      name ?? this.name,
      description !== undefined ? description : this.description,
      price ?? this.price,
      stock ?? this.stock,
      isActive ?? this.isActive,
      this.createdAt,
      new Date(),
    );
  }
}

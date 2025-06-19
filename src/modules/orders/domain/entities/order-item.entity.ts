export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly price: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    orderId: string,
    productId: string,
    quantity: number,
    price: number,
  ): OrderItem {
    return new OrderItem(
      undefined as any, // ID será generado por la base de datos
      orderId,
      productId,
      quantity,
      price,
      new Date(),
      new Date(),
    );
  }

  get subtotal(): number {
    return this.price * this.quantity;
  }
}

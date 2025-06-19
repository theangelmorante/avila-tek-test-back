import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(1, { message: 'El nombre es requerido' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  price: number;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock: number;
}

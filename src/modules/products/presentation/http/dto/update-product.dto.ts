import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(1, { message: 'El nombre debe tener al menos 1 carácter' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  stock?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  isActive?: boolean;
}

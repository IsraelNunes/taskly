import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartaoDto {
  @IsString()
  @IsNotEmpty()
  holderName!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsString()
  @IsNotEmpty()
  expiryMonth!: string;

  @IsString()
  @IsNotEmpty()
  expiryYear!: string;

  @IsString()
  @IsNotEmpty()
  cvv!: string;

  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  cep!: string;

  @IsString()
  @IsNotEmpty()
  numeroEndereco!: string;

  @IsOptional()
  @IsString()
  telefone?: string;
}

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  valor!: number;

  @IsEnum(['PIX', 'CARTAO', 'DINHEIRO'])
  metodo!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF inválido. Envie apenas os 11 dígitos sem pontuação.' })
  cpf?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CartaoDto)
  cartao?: CartaoDto;
}

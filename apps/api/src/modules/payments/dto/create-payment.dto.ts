import { IsEnum, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0)
  valor!: number;

  @IsEnum(['PIX', 'CARTAO', 'DINHEIRO'])
  metodo!: string;
}

import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateServiceRequestDto {
  @IsUUID()
  professionalId!: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsDateString()
  @IsOptional()
  dataAgendada?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorEstimado?: number;
}

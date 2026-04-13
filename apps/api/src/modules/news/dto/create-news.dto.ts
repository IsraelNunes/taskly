import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { NewsStatus } from '../../../db/schema';

enum NewsStatusDto {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
}

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  titulo!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imagem?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  resumo!: string;

  @IsString()
  @IsNotEmpty()
  texto!: string;

  @IsOptional()
  @IsEnum(NewsStatusDto)
  status?: NewsStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataPublicacao?: Date;
}

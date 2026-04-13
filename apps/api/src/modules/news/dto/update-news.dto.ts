import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { NewsStatus } from '../../../db/schema';

enum NewsStatusDto {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imagem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  resumo?: string;

  @IsOptional()
  @IsString()
  texto?: string;

  @IsOptional()
  @IsEnum(NewsStatusDto)
  status?: NewsStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataPublicacao?: Date;
}

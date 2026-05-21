import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateCityDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsUUID('4')
  ufId?: string;
}

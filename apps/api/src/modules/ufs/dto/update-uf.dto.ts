import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateUfDto {
  @IsOptional()
  @IsString()
  @Length(2, 2)
  sigla?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;
}

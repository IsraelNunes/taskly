import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateProfessionalProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsUUID()
  cidadeId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}

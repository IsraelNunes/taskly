import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

export class AddPortfolioImageDto {
  @IsUrl()
  @IsNotEmpty()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;
}

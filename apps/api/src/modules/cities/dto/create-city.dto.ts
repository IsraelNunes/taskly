import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;

  @IsUUID('4')
  ufId!: string;
}

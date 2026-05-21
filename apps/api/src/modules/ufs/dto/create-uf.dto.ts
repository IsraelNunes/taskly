import { IsNotEmpty, IsString, Length, MaxLength } from 'class-validator';

export class CreateUfDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  sigla!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome!: string;
}

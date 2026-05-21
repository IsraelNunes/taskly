import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminCreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(80)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  perfil?: string;
}

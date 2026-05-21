import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

enum RegisterProfileRole {
  CLIENTE = 'CLIENTE',
  PROFISSIONAL = 'PROFISSIONAL',
}

export class RegisterDto {
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
  @IsEnum(RegisterProfileRole)
  perfil?: RegisterProfileRole;
}

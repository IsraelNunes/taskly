import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

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

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF inválido. Envie apenas os 11 dígitos sem pontuação.' })
  cpf?: string;
}

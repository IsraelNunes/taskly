import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

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
}

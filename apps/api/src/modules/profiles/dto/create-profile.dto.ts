import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  descricao!: string;
}

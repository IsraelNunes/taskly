import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ProfilesService } from '../profiles/profiles.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: unknown }> {
    const existing = await this.usersService.findByUsername(dto.username);

    if (existing) {
      throw new ConflictException('Username já está em uso.');
    }

    const leitorProfile = await this.profilesService.findOrCreate('LEITOR');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      nome: dto.nome,
      username: dto.username,
      passwordHash,
      perfilId: leitorProfile.id,
    });

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      perfil: leitorProfile.descricao,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const publicUser = await this.usersService.findPublicById(user.id);

    return {
      accessToken,
      user: publicUser,
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: unknown }> {
    const user = await this.usersService.findAuthByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      perfil: user.perfil,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const publicUser = await this.usersService.findPublicById(user.id);

    return {
      accessToken,
      user: publicUser,
    };
  }

  async me(userId: string): Promise<unknown> {
    return this.usersService.findPublicById(userId);
  }
}

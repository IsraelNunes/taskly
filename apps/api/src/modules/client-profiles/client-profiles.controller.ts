import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { ClientProfilesService } from './client-profiles.service';

@Controller('perfil-cliente')
export class ClientProfilesController {
  constructor(private readonly service: ClientProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.service.findByUserId(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateClientProfileDto) {
    return this.service.update(user.sub, dto);
  }

  @Get(':userId')
  getPublic(@Param('userId') userId: string) {
    return this.service.findPublicByUserId(userId);
  }
}

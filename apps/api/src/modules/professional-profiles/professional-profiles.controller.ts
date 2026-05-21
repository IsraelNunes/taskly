import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { AddPortfolioImageDto } from './dto/add-portfolio-image.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { ProfessionalProfilesService } from './professional-profiles.service';

@Controller('perfil-profissional')
export class ProfessionalProfilesController {
  constructor(private readonly service: ProfessionalProfilesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.service.findByUserId(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfessionalProfileDto) {
    return this.service.update(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portfolio')
  addImage(@CurrentUser() user: JwtPayload, @Body() dto: AddPortfolioImageDto) {
    return this.service.addPortfolioImage(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('portfolio/:imageId')
  removeImage(@CurrentUser() user: JwtPayload, @Param('imageId') imageId: string) {
    return this.service.removePortfolioImage(user.sub, imageId);
  }

  @Get(':userId')
  getPublic(@Param('userId') userId: string) {
    return this.service.findByUserId(userId);
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

@Controller('noticias')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async findAll() {
    return this.newsService.findAllPublic();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.newsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateNewsDto, @CurrentUser() user: JwtPayload) {
    return this.newsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNewsDto, @CurrentUser() user: JwtPayload) {
    return this.newsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.newsService.remove(id, user);
  }
}

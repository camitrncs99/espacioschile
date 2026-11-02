import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SearchSpacesDto } from './dto/search-spaces.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSpace(
    @Body() createSpaceDto: CreateSpaceDto,
    @CurrentUser() user: User,
  ) {
    return await this.spacesService.create(createSpaceDto, user);
  }

  @Get()
  async getSpaces(@Query() searchDto: SearchSpacesDto) {
    return await this.spacesService.search(searchDto);
  }

  @Get(':id')
  async getSpaceById(@Param('id') id: string) {
    return await this.spacesService.findOne(id);
  }
}
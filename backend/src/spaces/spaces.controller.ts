import { Controller, Get, Param, Query } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { SearchSpacesDto } from './dto/search-spaces.dto';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  async getSpaces(@Query() searchDto: SearchSpacesDto) {
    return await this.spacesService.search(searchDto);
  }

  @Get(':id')
  async getSpaceById(@Param('id') id: string) {
    return await this.spacesService.findOne(id);
  }
}
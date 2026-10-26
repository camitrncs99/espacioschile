import { Controller, Get } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { Space } from './entities/space.entity';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  async getAllSpaces(): Promise<Space[]> {
    return await this.spacesService.findAll();
  }
}
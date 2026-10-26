import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spacesRepository: Repository<Space>,
  ) {}

  async findAll(): Promise<Space[]> {
    return await this.spacesRepository.find({
      where: {
        isPublished: true,
        isModerated: true,
      },
    });
  }
}
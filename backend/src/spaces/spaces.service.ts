import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { SpaceImage } from './entities/space-image.entity';
import { SpaceAmenity } from './entities/space-amenity.entity';
import { SearchSpacesDto } from './dto/search-spaces.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spacesRepository: Repository<Space>,
    @InjectRepository(SpaceImage)
    private readonly imagesRepository: Repository<SpaceImage>,
    @InjectRepository(SpaceAmenity)
    private readonly amenitiesRepository: Repository<SpaceAmenity>,
  ) {}

  async create(createSpaceDto: CreateSpaceDto, owner: User): Promise<Space> {
    const { lat, lng, amenities, images, ...rest } = createSpaceDto;

    // Crear el punto geográfico PostGIS SRID 4326 (WGS84)
    const locationPoint = {
      type: 'Point' as const,
      coordinates: [lng, lat],
    };

    const newSpace = this.spacesRepository.create({
      ...rest,
      ownerId: owner.id,
      location: locationPoint,
      isPublished: true,
      isModerated: true,
    });

    const savedSpace = await this.spacesRepository.save(newSpace);

    // Guardar amenidades si vienen en el payload
    if (amenities && amenities.length > 0) {
      const amenityEntities = amenities.map((key) =>
        this.amenitiesRepository.create({
          spaceId: savedSpace.id,
          amenityKey: key,
        }),
      );
      await this.amenitiesRepository.save(amenityEntities);
    }

    // Guardar imágenes si vienen en el payload
    if (images && images.length > 0) {
      const imageEntities = images.map((url, index) =>
        this.imagesRepository.create({
          spaceId: savedSpace.id,
          imageUrl: url,
          isCover: index === 0,
          displayOrder: index,
        }),
      );
      await this.imagesRepository.save(imageEntities);
    }

    return await this.findOne(savedSpace.id);
  }

  async search(filters: SearchSpacesDto): Promise<any[]> {
    const query = this.spacesRepository
      .createQueryBuilder('space')
      .leftJoinAndSelect('space.images', 'image')
      .leftJoinAndSelect('space.amenities', 'amenity')
      .where('space.is_published = :isPublished', { isPublished: true })
      .andWhere('space.is_moderated = :isModerated', { isModerated: true });

    if (filters.commune) {
      query.andWhere('LOWER(space.commune) = LOWER(:commune)', {
        commune: filters.commune,
      });
    }

    if (filters.category) {
      query.andWhere('space.category = :category', {
        category: filters.category,
      });
    }

    if (filters.subCategory) {
      query.andWhere('LOWER(space.sub_category) LIKE LOWER(:subCategory)', {
        subCategory: `%${filters.subCategory}%`,
      });
    }

    if (filters.maxPrice) {
      query.andWhere(
        '(space.price_per_day <= :maxPrice OR space.price_per_month <= :maxPrice)',
        { maxPrice: filters.maxPrice },
      );
    }

    if (filters.lat !== undefined && filters.lng !== undefined) {
      const radius = filters.radiusMeters || 5000;
      query.andWhere(
        `ST_DWithin(
          space.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        { lng: filters.lng, lat: filters.lat, radius },
      );

      query.addSelect(
        `ROUND(
          ST_Distance(
            space.location::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
          )
        )`,
        'distance_meters',
      );

      query.orderBy('distance_meters', 'ASC');
      return await query.getRawMany();
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Space> {
    const space = await this.spacesRepository.findOne({
      where: { id },
      relations: ['images', 'amenities'],
    });
    if (!space) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }
    return space;
  }
}
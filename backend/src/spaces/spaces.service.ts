import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { SearchSpacesDto } from './dto/search-spaces.dto';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spacesRepository: Repository<Space>,
  ) {}

  async search(filters: SearchSpacesDto): Promise<any[]> {
    const query = this.spacesRepository
      .createQueryBuilder('space')
      .where('space.is_published = :isPublished', { isPublished: true })
      .andWhere('space.is_moderated = :isModerated', { isModerated: true });

    // 1. Filtro por comuna
    if (filters.commune) {
      query.andWhere('LOWER(space.commune) = LOWER(:commune)', {
        commune: filters.commune,
      });
    }

    // 2. Filtro por categoría general (CERRADO / ABIERTO)
    if (filters.category) {
      query.andWhere('space.category = :category', {
        category: filters.category,
      });
    }

    // 3. Filtro por subcategoría (Oficinas, Azoteas, etc.)
    if (filters.subCategory) {
      query.andWhere('LOWER(space.sub_category) LIKE LOWER(:subCategory)', {
        subCategory: `%${filters.subCategory}%`,
      });
    }

    // 4. Filtro por precio máximo (compara contra día o mes)
    if (filters.maxPrice) {
      query.andWhere(
        '(space.price_per_day <= :maxPrice OR space.price_per_month <= :maxPrice)',
        { maxPrice: filters.maxPrice },
      );
    }

    // 5. Búsqueda y cálculo geoespacial (PostGIS)
    if (filters.lat !== undefined && filters.lng !== undefined) {
      const radius = filters.radiusMeters || 5000;

      // ST_DWithin usando geography para calcular radios reales sobre la Tierra
      query.andWhere(
        `ST_DWithin(
          space.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        { lng: filters.lng, lat: filters.lat, radius },
      );

      // Calcular la distancia exacta en metros para ordenarlos por cercanía
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

  async findOne(id: string): Promise<Space | null> {
    return await this.spacesRepository.findOne({
      where: { id, isPublished: true, isModerated: true },
    });
  }
}
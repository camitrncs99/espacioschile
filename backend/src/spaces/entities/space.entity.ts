import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Point } from 'geojson';
import { SpaceImage } from './space-image.entity';
import { SpaceAmenity } from './space-amenity.entity';

export enum SpaceCategory {
  CERRADO = 'CERRADO',
  ABIERTO = 'ABIERTO',
}

export enum PricingModality {
  HORA = 'HORA',
  DIA = 'DIA',
  MES = 'MES',
  FLEXIBLE = 'FLEXIBLE',
}

@Entity({ name: 'spaces' })
export class Space {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: SpaceCategory,
  })
  category: SpaceCategory;

  @Column({ name: 'sub_category', length: 100 })
  subCategory: string;

  @Column({ name: 'surface_m2', type: 'numeric', precision: 8, scale: 2 })
  surfaceM2: number;

  @Column({ name: 'capacity_people', type: 'int', nullable: true })
  capacityPeople: number;

  @Column({ name: 'address_street', length: 255 })
  addressStreet: string;

  @Column({ length: 100 })
  commune: string;

  @Column({ length: 100, default: 'Metropolitana' })
  region: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({
    name: 'pricing_mode',
    type: 'enum',
    enum: PricingModality,
  })
  pricingMode: PricingModality;

  @Column({ name: 'price_per_hour', type: 'numeric', precision: 12, scale: 2, nullable: true })
  pricePerHour: number;

  @Column({ name: 'price_per_day', type: 'numeric', precision: 12, scale: 2, nullable: true })
  pricePerDay: number;

  @Column({ name: 'price_per_month', type: 'numeric', precision: 12, scale: 2, nullable: true })
  pricePerMonth: number;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'is_moderated', type: 'boolean', default: false })
  isModerated: boolean;

  @OneToMany(() => SpaceImage, (image) => image.space, { cascade: true })
  images: SpaceImage[];

  @OneToMany(() => SpaceAmenity, (amenity) => amenity.space, { cascade: true })
  amenities: SpaceAmenity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Space } from './space.entity';

@Entity({ name: 'space_amenities' })
@Unique(['spaceId', 'amenityKey'])
export class SpaceAmenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'space_id', type: 'uuid' })
  spaceId: string;

  @Column({ name: 'amenity_key', length: 50 })
  amenityKey: string;

  @ManyToOne(() => Space, (space) => space.amenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'space_id' })
  space: Space;
}
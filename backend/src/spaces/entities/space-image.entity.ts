import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Space } from './space.entity';

@Entity({ name: 'space_images' })
export class SpaceImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'space_id', type: 'uuid' })
  spaceId: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ name: 'is_cover', type: 'boolean', default: false })
  isCover: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => Space, (space) => space.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'space_id' })
  space: Space;
}
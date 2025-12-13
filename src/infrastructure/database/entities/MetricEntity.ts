
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('metrics')
@Index(['userId', 'type', 'timestamp'])
@Index(['userId', 'timestamp'])
export class MetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  value!: number;

  @Column({ type: 'varchar', length: 50 })
  originalUnit!: string;

  @Column({ type: 'bigint' })
  @Index()
  timestamp!: number;

  @CreateDateColumn()
  createdAt!: Date;
}


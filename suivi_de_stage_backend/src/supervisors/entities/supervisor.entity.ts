import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Internship } from '../../internships/entities/internship.entity';

@Entity('supervisors')
@Index('UQ_supervisors_user_id', ['userId'], { unique: true })
export class Supervisor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  fonction: string;

  @Column({ type: 'varchar', length: 150 })
  specialite: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Internship, (internship) => internship.supervisor)
  internships: Internship[];

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

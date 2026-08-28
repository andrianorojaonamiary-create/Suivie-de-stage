import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Internship } from '../../internships/entities/internship.entity';
import { FollowUpType } from '../enums/follow-up-type.enum';

@Entity('internship_follow_ups')
@Index('IDX_follow_ups_internship_date', ['internshipId', 'date'])
export class InternshipFollowUp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => Internship, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internship_id' })
  internship: Internship;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_id' })
  auteur: User;

  @Column({ type: 'text' })
  contenu: string;

  @CreateDateColumn({ type: 'timestamptz' })
  date: Date;

  @Column({
    type: 'enum',
    enum: FollowUpType,
    enumName: 'follow_ups_type_enum',
    default: FollowUpType.OBSERVATION,
  })
  type: FollowUpType;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

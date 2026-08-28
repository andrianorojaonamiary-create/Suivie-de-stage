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
import { Internship } from '../../internships/entities/internship.entity';
import { User } from '../../users/entities/user.entity';
import { EvaluatorType } from '../enums/evaluator-type.enum';

@Entity('evaluations')
@Index(
  'UQ_evaluations_stage_evaluator_type',
  ['stageId', 'evaluateurId', 'typeEvaluateur'],
  { unique: true },
)
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stage_id', type: 'uuid' })
  stageId: string;

  @ManyToOne(() => Internship, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_id' })
  stage: Internship;

  @Column({ name: 'evaluateur_id', type: 'uuid' })
  evaluateurId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'evaluateur_id' })
  evaluateur: User;

  @Column({
    name: 'type_evaluateur',
    type: 'enum',
    enum: EvaluatorType,
    enumName: 'evaluations_evaluator_type_enum',
  })
  typeEvaluateur: EvaluatorType;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  note: number;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'text', nullable: true })
  observation: string | null;

  @Column({
    name: 'date_evaluation',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateEvaluation: Date;

  @Column({ default: false })
  validee: boolean;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

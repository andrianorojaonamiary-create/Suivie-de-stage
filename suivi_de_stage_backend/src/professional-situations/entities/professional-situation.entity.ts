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
import { Student } from '../../students/entities/student.entity';
import { ProfessionalSituationType } from '../enums/professional-situation-type.enum';

@Entity('professional_situations')
@Index('IDX_professional_situations_student_date', [
  'studentId',
  'dateCreation',
])
export class ProfessionalSituation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({
    type: 'enum',
    enum: ProfessionalSituationType,
    enumName: 'professional_situations_type_enum',
  })
  situation: ProfessionalSituationType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  entreprise: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  poste: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  domaine: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ville: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pays: string | null;

  @Column({ name: 'date_debut', type: 'date', nullable: true })
  dateDebut: string | null;

  @Column({ name: 'date_fin', type: 'date', nullable: true })
  dateFin: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

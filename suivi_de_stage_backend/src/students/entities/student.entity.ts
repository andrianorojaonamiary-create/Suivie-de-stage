import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AcademicStatus } from '../enums/academic-status.enum';
import { EmploymentStatus } from '../enums/employment-status.enum';
import { StudentLevel } from '../enums/student-level.enum';
import { StudentParcours } from '../enums/student-parcours.enum';
import { ProfessionalSituation } from '../../professional-situations/entities/professional-situation.entity';

@Entity('students')
@Index('UQ_students_matricule', ['matricule'], { unique: true })
@Index('UQ_students_user_id', ['userId'], { unique: true })
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  matricule: string;

  @Column({ type: 'varchar', length: 150 })
  formation: StudentParcours | string;

  @Column({ type: 'varchar', length: 100 })
  niveau: StudentLevel | string;

  @Column({ type: 'varchar', length: 20 })
  promotion: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone: string | null;

  @Column({ type: 'text', nullable: true })
  adresse: string | null;

  @Column({
    name: 'statut_academique',
    type: 'enum',
    enum: AcademicStatus,
    enumName: 'students_academic_status_enum',
    default: AcademicStatus.ACTIF,
  })
  statutAcademique: AcademicStatus;

  @Column({
    name: 'situation_professionnelle',
    type: 'enum',
    enum: EmploymentStatus,
    enumName: 'students_employment_status_enum',
    default: EmploymentStatus.NON_RENSEIGNE,
  })
  situationProfessionnelle: EmploymentStatus;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'encadreur_id', type: 'uuid', nullable: true })
  encadreurId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'encadreur_id' })
  encadreur: User | null;

  @Column({ name: 'entreprise_id', type: 'uuid', nullable: true })
  entrepriseId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'entreprise_id' })
  entreprise: User | null;

  @OneToMany(() => ProfessionalSituation, (situation) => situation.student)
  situationsProfessionnelles: ProfessionalSituation[];

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;

  @DeleteDateColumn({
    name: 'date_suppression',
    type: 'timestamptz',
    nullable: true,
  })
  dateSuppression: Date | null;
}

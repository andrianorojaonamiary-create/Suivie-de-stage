import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Report } from '../../reports/entities/report.entity';
import { Student } from '../../students/entities/student.entity';
import { Supervisor } from '../../supervisors/entities/supervisor.entity';
import { User } from '../../users/entities/user.entity';
import { InternshipStatus } from '../enums/internship-status.enum';

@Entity('internships')
@Index('IDX_internships_status', ['statut'])
@Index('IDX_internships_dates', ['dateDebut', 'dateFin'])
export class Internship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'supervisor_id', type: 'uuid', nullable: true })
  supervisorId: string | null;

  @ManyToOne(() => Supervisor, { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: Supervisor | null;

  @Column({ name: 'tuteur_id', type: 'uuid', nullable: true })
  tuteurId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'tuteur_id' })
  tuteur: User | null;

  @Column({
    name: 'encadreur_professionnel_nom',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  encadreurProfessionnelNom: string | null;

  @Column({ type: 'varchar', length: 200 })
  intitule: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 150 })
  domaine: string;

  @Column({ type: 'varchar', length: 255 })
  lieu: string;

  @Column({ type: 'varchar', length: 100 })
  ville: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: string;

  @Column({ name: 'date_fin', type: 'date' })
  dateFin: string;

  @Column({
    type: 'enum',
    enum: InternshipStatus,
    enumName: 'internships_status_enum',
    default: InternshipStatus.A_VENIR,
  })
  statut: InternshipStatus;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  convention: string | null;

  @Column({
    name: 'convention_nom',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  conventionNom: string | null;

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

  @OneToMany(() => Report, (report) => report.stage)
  reports: Report[];
}

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
import { User } from '../../users/entities/user.entity';

// Table de jonction "affectation" : quel enseignant (tuteur pedagogique) est
// affecte a quel etudiant. Independante du stage, ce qui permet d'affecter un
// tuteur avant meme que l'etudiant depose sa candidature.
//
// Un etudiant n'a qu'un seul tuteur actif, garantie par l'index unique partiel
// UQ_teacher_assignments_one_active (student_id) WHERE date_fin IS NULL.
// L'affectation alimente automatiquement internships.tuteur_id.
//
// "date_fin" cloture une affectation sans la supprimer, ce qui conserve
// l'historique des remplacements de tuteur.
@Entity('teacher_assignments')
@Index('IDX_teacher_assignments_teacher', ['teacherId'])
export class TeacherAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'date_affectation', type: 'timestamptz' })
  dateAffectation: Date;

  @Column({ name: 'date_fin', type: 'timestamptz', nullable: true })
  dateFin: Date | null;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedById: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by' })
  assignedBy: User | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

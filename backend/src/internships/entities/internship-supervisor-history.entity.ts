import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Internship } from './internship.entity';
import { Supervisor } from '../../supervisors/entities/supervisor.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Historique des affectations d'encadreur d'un stage.
 *
 * L'affectation se fait au niveau du stage et non de l'étudiant : un étudiant
 * peut avoir un encadreur différent à chaque stage. La table est donc le
 * journal des changements, et non un état.
 *
 * Une ligne est écrite à la création du stage (ancienSupervisorId null, donc
 * l'affectation initiale) puis à chaque changement d'encadreur.
 *
 * Le journal doit survivre à la suppression d'un encadreur, d'où
 * ON DELETE SET NULL sur ancienSupervisorId. Les lignes dont le nouvel
 * encadreur a disparu sont conservées telles quelles, l'identifiant restant
 * lisible dans nouveauSupervisorId.
 */
@Entity('internship_supervisor_history')
@Index('IDX_ish_internship_id', ['internshipId'])
@Index('IDX_ish_date_affectation', ['dateAffectation'])
export class InternshipSupervisorHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'internship_id', type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => Internship, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'internship_id',
    foreignKeyConstraintName: 'FK_ish_internship',
  })
  internship: Internship;

  /** Null uniquement pour l'affectation initiale, au moment de la création. */
  @Column({
    name: 'ancien_supervisor_id',
    type: 'uuid',
    nullable: true,
  })
  ancienSupervisorId: string | null;

  @ManyToOne(() => Supervisor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'ancien_supervisor_id',
    foreignKeyConstraintName: 'FK_ish_ancien_supervisor',
  })
  ancienSupervisor: Supervisor | null;

  @Column({ name: 'nouveau_supervisor_id', type: 'uuid' })
  nouveauSupervisorId: string;

  @ManyToOne(() => Supervisor, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'nouveau_supervisor_id',
    foreignKeyConstraintName: 'FK_ish_nouveau_supervisor',
  })
  nouveauSupervisor: Supervisor;

  @Column({ name: 'affected_by_user_id', type: 'uuid' })
  affectedByUserId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'affected_by_user_id',
    foreignKeyConstraintName: 'FK_ish_affected_by',
  })
  affectedByUser: User;

  @CreateDateColumn({ name: 'date_affectation', type: 'timestamptz' })
  dateAffectation: Date;
}

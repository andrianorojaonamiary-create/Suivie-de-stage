import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('users')
@Index('UQ_users_email', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  prenom: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricule?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  grade?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  departement?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  specialite?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone?: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'mot_de_passe', type: 'varchar', length: 255, select: false })
  motDePasse: string;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'users_role_enum',
    default: Role.ETUDIANT,
  })
  role: Role;

  @Column({ default: true })
  actif: boolean;

  @Column({
    name: 'password_reset_token',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  passwordResetToken?: string | null;

  @Column({
    name: 'password_reset_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  passwordResetExpiresAt?: Date | null;

  @Column({
    name: 'mot_de_passe_change_at',
    type: 'timestamptz',
    nullable: true,
  })
  motDePasseChangeAt?: Date | null;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

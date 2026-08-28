import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CompanyStatus } from '../enums/company-status.enum';

@Entity('companies')
@Index('UQ_companies_user_id', ['userId'], { unique: true })
@Index('UQ_companies_email', ['email'], { unique: true })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nom: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'secteur_activite', type: 'varchar', length: 150 })
  secteurActivite: string;

  @Column({ type: 'varchar', length: 255 })
  adresse: string;

  @Column({ type: 'varchar', length: 100 })
  ville: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone: string | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'site_web', type: 'varchar', length: 255, nullable: true })
  siteWeb: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({
    type: 'enum',
    enum: CompanyStatus,
    enumName: 'companies_status_enum',
    default: CompanyStatus.ACTIVE,
  })
  statut: CompanyStatus;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'date_creation', type: 'timestamptz' })
  dateCreation: Date;

  @UpdateDateColumn({ name: 'date_modification', type: 'timestamptz' })
  dateModification: Date;
}

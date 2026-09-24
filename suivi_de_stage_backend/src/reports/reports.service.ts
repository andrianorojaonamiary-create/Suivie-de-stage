import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, createReadStream, unlinkSync } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../users/enums/role.enum';
import { CreateReportDto } from './dto/create-report.dto';
import { FindReportsDto } from './dto/find-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { ReportStatus } from './enums/report-status.enum';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getUploadsDir() {
    return join(process.cwd(), 'uploads', 'reports');
  }

  async create(
    stageId: string,
    actor: AuthenticatedUser,
    file: Express.Multer.File,
    dto: CreateReportDto,
  ) {
    const stage = await this.loadStage(stageId);
    this.ensureStudentOwner(stage, actor);

    const report = this.reportsRepository.create({
      stageId,
      stage,
      type: dto.type,
      fileName: file.filename,
      originalName: file.originalname,
      size: file.size,
      statut: ReportStatus.EN_ATTENTE,
      commentaire: null,
    });
    const saved = await this.reportsRepository.save(report);
    await this.notificationsService.notifyReportSubmitted(stage, saved);
    return this.toPublicReport(saved);
  }

  async findAllByStage(stageId: string, actor: AuthenticatedUser) {
    const stage = await this.loadStage(stageId);
    this.ensureCanAccess(stage, actor);
    const reports = await this.reportsRepository.find({
      where: { stageId },
      relations: { stage: true },
      order: { dateCreation: 'DESC' },
    });
    return reports.map((report) => this.toPublicReport(report));
  }

  async findAll(dto: FindReportsDto, actor: AuthenticatedUser) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 50;
    const query = this.reportsRepository
      .createQueryBuilder('report')
      .innerJoinAndSelect('report.stage', 'stage')
      .innerJoinAndSelect('stage.student', 'reportStudent')
      .innerJoinAndSelect('reportStudent.user', 'reportStudentUser')
      .innerJoinAndSelect('stage.company', 'reportCompany')
      .leftJoinAndSelect('stage.supervisor', 'reportSupervisor')
      .leftJoinAndSelect('reportSupervisor.user', 'reportSupervisorUser')
      .leftJoinAndSelect('stage.tuteur', 'reportTuteur');

    this.applyAccessScope(query, actor);
    if (dto.statut)
      query.andWhere('report.statut = :statut', { statut: dto.statut });

    const [reports, total] = await query
      .orderBy('report.dateCreation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: reports.map((report) => this.toPublicReport(report)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const report = await this.loadReport(id);
    this.ensureCanAccess(report.stage, actor);
    return this.toPublicReport(report);
  }

  async updateStatus(
    id: string,
    dto: UpdateReportDto,
    actor: AuthenticatedUser,
  ) {
    const report = await this.loadReport(id);
    this.ensureCanReview(report.stage, actor);

    if (dto.statut === ReportStatus.REJETE && !dto.commentaire?.trim()) {
      throw new BadRequestException(
        'Un commentaire est obligatoire pour refuser un rapport.',
      );
    }
    if (dto.statut) report.statut = dto.statut;
    if (dto.commentaire !== undefined) report.commentaire = dto.commentaire || null;

    const saved = await this.reportsRepository.save(report);
    await this.notificationsService.notifyReportReviewed(
      report.stage,
      saved,
      saved.statut,
    );
    return this.toPublicReport(saved);
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const report = await this.loadReport(id);
    const isOwnerStudent =
      actor.role === Role.ETUDIANT &&
      report.stage.student?.user?.id === actor.id;
    if (actor.role !== Role.ADMINISTRATEUR && !isOwnerStudent) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer ce rapport.',
      );
    }
    if (isOwnerStudent && report.statut !== ReportStatus.EN_ATTENTE) {
      throw new ForbiddenException(
        'Un rapport déjà examiné ne peut plus être supprimé.',
      );
    }
    await this.reportsRepository.remove(report);
    const filePath = join(this.getUploadsDir(), report.fileName);
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch {
        // Un fichier manquant ne doit pas bloquer la suppression.
      }
    }
    return { message: 'Rapport supprimé avec succès.' };
  }

  async download(id: string, actor: AuthenticatedUser) {
    const report = await this.loadReport(id);
    this.ensureCanAccess(report.stage, actor);
    const filePath = join(this.getUploadsDir(), report.fileName);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Fichier de rapport introuvable.');
    }
    const extension = report.fileName.split('.').pop()?.toLowerCase();
    const contentType =
      extension === 'pdf'
        ? 'application/pdf'
        : extension === 'doc'
          ? 'application/msword'
          : extension === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/octet-stream';
    return {
      stream: new StreamableFile(createReadStream(filePath)),
      contentType,
      originalName: report.originalName,
    };
  }

  private async loadStage(id: string) {
    const stage = await this.internshipsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        company: true,
        supervisor: { user: true },
        tuteur: true,
      },
    });
    if (!stage) throw new NotFoundException('Stage introuvable.');
    return stage;
  }

  private async loadReport(id: string) {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: {
        stage: {
          student: { user: true },
          company: true,
          supervisor: { user: true },
          tuteur: true,
        },
      },
    });
    if (!report) throw new NotFoundException('Rapport introuvable.');
    return report;
  }

  private applyAccessScope(
    query: ReturnType<Repository<Report>['createQueryBuilder']>,
    actor: AuthenticatedUser,
  ) {
    if (actor.role === Role.ETUDIANT) {
      query.andWhere('reportStudentUser.id = :actorId', {
        actorId: actor.id,
      });
    } else if (actor.role === Role.ENSEIGNANT) {
      query.andWhere('stage.tuteurId = :actorId', { actorId: actor.id });
    } else if (actor.role === Role.ENCADREUR) {
      query.andWhere('reportSupervisorUser.id = :actorId', {
        actorId: actor.id,
      });
    } else if (actor.role !== Role.ADMINISTRATEUR) {
      query.andWhere('1 = 0');
    }
  }

  private ensureStudentOwner(stage: Internship, actor: AuthenticatedUser) {
    if (actor.role !== Role.ETUDIANT) {
      throw new ForbiddenException(
        'Seul l’étudiant propriétaire du stage peut déposer un rapport.',
      );
    }
    if (stage.student?.user?.id !== actor.id) {
      throw new ForbiddenException(
        'Vous ne pouvez pas déposer un rapport pour ce stage.',
      );
    }
  }

  private ensureCanAccess(stage: Internship, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ETUDIANT &&
        stage.student?.user?.id === actor.id) ||
      (actor.role === Role.ENCADREUR &&
        stage.supervisor?.user?.id === actor.id) ||
      (actor.role === Role.ENSEIGNANT && stage.tuteurId === actor.id);
    if (!allowed)
      throw new ForbiddenException('Vous ne pouvez pas accéder à ce rapport.');
  }

  private ensureCanReview(stage: Internship, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ENSEIGNANT && stage.tuteurId === actor.id) ||
      (actor.role === Role.ENCADREUR &&
        stage.supervisor?.user?.id === actor.id);
    if (!allowed)
      throw new ForbiddenException(
        'Vous ne pouvez pas examiner ce rapport.',
      );
  }

  private toPublicReport(report: Report) {
    const stage = report.stage;
    return {
      id: report.id,
      stageId: report.stageId,
      type: report.type,
      fileName: report.fileName,
      originalName: report.originalName,
      size: report.size,
      statut: report.statut,
      commentaire: report.commentaire,
      dateCreation: report.dateCreation,
      dateModification: report.dateModification,
      stage: stage
        ? {
            id: stage.id,
            intitule: stage.intitule,
            entreprise: stage.company?.nom ?? null,
            etudiantId: stage.student?.id ?? null,
            etudiant: stage.student?.user
              ? [
                  stage.student.user.prenom ?? '',
                  stage.student.user.nom ?? '',
                ]
                  .filter(Boolean)
                  .join(' ')
              : null,
            tuteurId: stage.tuteurId ?? null,
            enseignant: stage.tuteur
              ? {
                  id: stage.tuteur.id,
                  nom: stage.tuteur.nom,
                  prenom: stage.tuteur.prenom,
                }
              : null,
            encadreurId: stage.supervisor?.id ?? null,
          }
        : null,
    };
  }
}
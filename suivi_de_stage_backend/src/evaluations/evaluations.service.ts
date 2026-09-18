import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { FindEvaluationsDto } from './dto/find-evaluations.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { Evaluation } from './entities/evaluation.entity';
import { NotificationsService } from '../notifications/notifications.service';

interface AuthenticatedUser {
  id: string;
  role: Role;
}

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(Internship)
    private readonly internshipsRepository: Repository<Internship>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateEvaluationDto, actor: AuthenticatedUser) {
    const stage = await this.findStage(dto.stageId);
    const evaluator = await this.usersService.findActiveById(dto.evaluateurId);
    if (!evaluator || evaluator.role !== Role.ENCADREUR) {
      throw new NotFoundException('Évaluateur introuvable ou type incorrect.');
    }
    if (actor.role !== Role.ADMINISTRATEUR && dto.evaluateurId !== actor.id) {
      throw new ForbiddenException('Vous ne pouvez évaluer qu’en votre nom.');
    }
    this.ensureEvaluatorOnStage(stage, evaluator.id);
    const evaluation = this.evaluationsRepository.create({
      ...dto,
      stageId: dto.stageId,
      stage,
      evaluateur: evaluator,
      dateEvaluation: dto.dateEvaluation
        ? new Date(dto.dateEvaluation)
        : undefined,
    });
    const savedEvaluation = await this.saveAndSerialize(evaluation);
    await this.notificationsService.notifyEvaluation(stage);
    return savedEvaluation;
  }

  async findAll(
    stageId: string,
    dto: FindEvaluationsDto,
    actor: AuthenticatedUser,
  ) {
    const stage = await this.findStage(stageId);
    this.ensureCanRead(stage, actor);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const query = this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.evaluateur', 'evaluator')
      .where('evaluation.stageId = :stageId', { stageId });
    if (dto.typeEvaluateur)
      query.andWhere('evaluation.typeEvaluateur = :typeEvaluateur', {
        typeEvaluateur: dto.typeEvaluateur,
      });
    const [evaluations, total] = await query
      .orderBy('evaluation.dateEvaluation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data: evaluations.map((evaluation) =>
        this.toPublicEvaluation(evaluation),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const evaluation = await this.findEvaluation(id);
    this.ensureCanRead(evaluation.stage, actor);
    return this.toPublicEvaluation(evaluation);
  }

  async update(id: string, dto: UpdateEvaluationDto, actor: AuthenticatedUser) {
    const evaluation = await this.findEvaluation(id);
    this.ensureCanRead(evaluation.stage, actor);
    if (
      actor.role !== Role.ADMINISTRATEUR &&
      evaluation.evaluateurId !== actor.id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que vos propres évaluations.',
      );
    }
    if (actor.role !== Role.ADMINISTRATEUR) {
      const keys = Object.keys(dto);
      if (
        keys.some(
          (key) =>
            ![
              'note',
              'commentaire',
              'observation',
              'appreciationGenerale',
            ].includes(key),
        )
      ) {
        throw new ForbiddenException(
          'Seuls la note et les commentaires peuvent être modifiés.',
        );
      }
    }
    Object.assign(evaluation, dto);
    if (dto.dateEvaluation)
      evaluation.dateEvaluation = new Date(dto.dateEvaluation);
    return this.saveAndSerialize(evaluation);
  }

  async validate(id: string, actor: AuthenticatedUser) {
    if (actor.role !== Role.ADMINISTRATEUR)
      throw new ForbiddenException(
        'Seul un administrateur peut valider une évaluation.',
      );
    const evaluation = await this.findEvaluation(id);
    evaluation.validee = true;
    return this.saveAndSerialize(evaluation);
  }

  private async findStage(id: string) {
    const stage = await this.internshipsRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        company: { user: true },
        supervisor: { user: true },
      },
    });
    if (!stage) throw new NotFoundException('Stage introuvable.');
    return stage;
  }

  private async findEvaluation(id: string) {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id },
      relations: {
        stage: {
          student: { user: true },
          company: { user: true },
          supervisor: { user: true },
        },
        evaluateur: true,
      },
    });
    if (!evaluation) throw new NotFoundException('Évaluation introuvable.');
    return evaluation;
  }

  private ensureEvaluatorOnStage(stage: Internship, evaluatorId: string) {
    const assignedId = stage.supervisor?.user?.id;
    if (assignedId !== evaluatorId)
      throw new ForbiddenException('Vous n’êtes pas affecté à ce stage.');
  }

  private ensureCanRead(stage: Internship, actor: AuthenticatedUser) {
    const allowed =
      actor.role === Role.ADMINISTRATEUR ||
      (actor.role === Role.ETUDIANT && stage.student.user?.id === actor.id) ||
      (actor.role === Role.ENCADREUR &&
        stage.supervisor?.user?.id === actor.id);
    if (!allowed)
      throw new ForbiddenException(
        'Vous ne pouvez pas consulter cette évaluation.',
      );
  }

  private async saveAndSerialize(evaluation: Evaluation) {
    try {
      return this.toPublicEvaluation(
        await this.evaluationsRepository.save(evaluation),
      );
    } catch (error) {
      const code = (error as { driverError?: { code?: string } }).driverError
        ?.code;
      if (code === '23505')
        throw new ConflictException(
          'Une évaluation existe déjà pour cet évaluateur et ce stage.',
        );
      throw error;
    }
  }

  private toPublicEvaluation(evaluation: Evaluation) {
    return {
      id: evaluation.id,
      stageId: evaluation.stageId,
      evaluateur: evaluation.evaluateur
        ? {
            id: evaluation.evaluateur.id,
            nom: evaluation.evaluateur.nom,
            prenom: evaluation.evaluateur.prenom,
          }
        : { id: evaluation.evaluateurId },
      typeEvaluateur: evaluation.typeEvaluateur,
      note: evaluation.note,
      commentaire: evaluation.commentaire,
      observation: evaluation.observation,
      appreciationGenerale: evaluation.appreciationGenerale,
      dateEvaluation: evaluation.dateEvaluation,
      validee: evaluation.validee,
      dateCreation: evaluation.dateCreation,
      dateModification: evaluation.dateModification,
    };
  }
}

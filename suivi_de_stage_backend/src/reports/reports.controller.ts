import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { CreateReportDto } from './dto/create-report.dto';
import { FindReportsDto } from './dto/find-reports.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('stages/:id')
  @Roles(Role.ETUDIANT)
  @UseInterceptors(
    FileInterceptor('fichier', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const dir = join(process.cwd(), 'uploads', 'reports');
          mkdirSync(dir, { recursive: true });
          callback(null, dir);
        },
        filename: (_req, file, callback) => {
          const extension = file.originalname.split('.').pop()?.toLowerCase() || 'file';
          callback(null, `${randomUUID()}.${extension}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const extension = file.originalname.split('.').pop()?.toLowerCase();
        if (
          ALLOWED_MIME_TYPES.includes(file.mimetype) &&
          ['pdf', 'doc', 'docx'].includes(extension ?? '')
        ) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Seuls les fichiers PDF, DOC et DOCX sont acceptés.',
            ),
            false,
          );
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Param('id', new ParseUUIDPipe()) stageId: string,
    @Body() dto: CreateReportDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.create(stageId, request.user, file, dto);
  }

  @Get()
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT, Role.ENCADREUR, Role.ETUDIANT)
  findAll(
    @Query() dto: FindReportsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.findAll(dto, request.user);
  }

  @Get('stages/:id')
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT, Role.ENCADREUR, Role.ETUDIANT)
  findAllByStage(
    @Param('id', new ParseUUIDPipe()) stageId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.findAllByStage(stageId, request.user);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT, Role.ENCADREUR, Role.ETUDIANT)
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.findOne(id, request.user);
  }

  @Get(':id/download')
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT, Role.ENCADREUR, Role.ETUDIANT)
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { stream, contentType, originalName } =
      await this.reportsService.download(id, request.user);
    response.setHeader('Content-Type', contentType);
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${originalName}"`,
    );
    return stream;
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENSEIGNANT, Role.ENCADREUR)
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReportDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.updateStatus(id, dto, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reportsService.remove(id, request.user);
  }
}
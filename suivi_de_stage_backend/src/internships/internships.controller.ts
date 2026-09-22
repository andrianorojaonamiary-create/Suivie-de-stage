import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  ParseFilePipe,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
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
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { FindInternshipsDto } from './dto/find-internships.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { InternshipsService } from './internships.service';

interface AuthenticatedRequest extends Request {
  user: { id: string; role: Role };
}

@Controller('internships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT)
  create(
    @Body() dto: CreateInternshipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.create(dto, request.user);
  }

  @Get()
  findAll(
    @Query() dto: FindInternshipsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.findAll(dto, request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.findOne(id, request.user);
  }

  @Post(':id/convention')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT)
  @UseInterceptors(
    FileInterceptor('fichier', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const dir = join(process.cwd(), 'uploads', 'conventions');
          mkdirSync(dir, { recursive: true });
          callback(null, dir);
        },
        filename: (_req, _file, callback) => {
          callback(null, `${randomUUID()}.pdf`);
        },
      }),
      fileFilter: (_req, _file, callback) => {
        if (_file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Seuls les fichiers PDF sont acceptés.'),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadConvention(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.saveConvention(
      id,
      request.user,
      file.filename,
      file.originalname,
    );
  }

  @Get(':id/convention')
  async downloadConvention(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { filename, originalName } =
      await this.internshipsService.getConventionFilename(id, request.user);
    const filePath = join(process.cwd(), 'uploads', 'conventions', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Fichier de convention introuvable.');
    }
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${originalName || filename}"`,
    );
    return new StreamableFile(createReadStream(filePath));
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ENCADREUR, Role.ENSEIGNANT, Role.ETUDIANT)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInternshipDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.update(id, dto, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRATEUR, Role.ETUDIANT)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.internshipsService.remove(id, request.user);
  }
}

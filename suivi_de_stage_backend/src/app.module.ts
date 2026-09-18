import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { SupervisorsModule } from './supervisors/supervisors.module';
import { CompaniesModule } from './companies/companies.module';
import { InternshipsModule } from './internships/internships.module';
import { InternshipTrackingModule } from './internship-tracking/internship-tracking.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ProfessionalSituationsModule } from './professional-situations/professional-situations.module';
import { MapModule } from './map/map.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      validate: (config: Record<string, unknown>) => {
        if (
          typeof config.JWT_SECRET !== 'string' ||
          config.JWT_SECRET.length < 32
        ) {
          throw new Error(
            'JWT_SECRET doit contenir au moins 32 caractères dans le fichier .env',
          );
        }

        return config;
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'emit_careertrack'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/database/migrations/*.{js,ts}'],
      }),
    }),
    UsersModule,
    AuthModule,
    StudentsModule,
    SupervisorsModule,
    CompaniesModule,
    InternshipsModule,
    InternshipTrackingModule,
    EvaluationsModule,
    NotificationsModule,
    StatisticsModule,
    ProfessionalSituationsModule,
    MapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const roles = [
      'ETUDIANT',
      'ENCADREUR',
      'ENSEIGNANT',
      'ADMINISTRATEUR',
      'ROLE_ETUDIANT',
      'ROLE_ENCADREUR',
      'ROLE_ENSEIGNANT',
      'ROLE_ADMINISTRATEUR',
    ];
    for (const role of roles) {
      try {
        await this.dataSource.query(
          `ALTER TYPE public.users_role_enum ADD VALUE IF NOT EXISTS '${role}';`,
        );
      } catch (err) {
        // Ignore
      }
      try {
        await this.dataSource.query(
          `ALTER TYPE public.utilisateurs_role_enum ADD VALUE IF NOT EXISTS '${role}';`,
        );
      } catch (err) {
        // Ignore
      }
    }
  }
}

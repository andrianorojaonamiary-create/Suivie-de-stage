import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
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

export const DATABASE_CONFIG_FACTORY = (configService: ConfigService) => ({
  type: 'postgres' as const,
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: Number(configService.get<string>('DB_PORT', '5432')),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_DATABASE', 'emit_careertrack'),
  autoLoadEntities: true,
  // Le schéma est versionné par les migrations, jamais introspectionné.
  // migrationsRun les applique au démarrage : c'est ce qui empêche le
  // décalage entre le code et la base, la cause du bug de démarrage d'origine.
  synchronize: false,
  migrationsRun: true,
  migrations: [__dirname + '/database/migrations/*.{js,ts}'],
});

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
    ThrottlerModule.forRoot([
      {
        // Plafond global par IP. Les routes sensibles (login, reset) resserrent
        // via @Throttle.
        ttl: 60_000,
        limit: 300,
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: DATABASE_CONFIG_FACTORY,
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

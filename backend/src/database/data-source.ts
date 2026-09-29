import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATABASE_CONFIG_FACTORY } from '../app.module';

// Reprend exactement la configuration de l'application (app.module.ts) pour
// que la CLI TypeORM et le runtime ne puissent pas diverger sur le nom de base
// ou les identifiants.
const configService = new ConfigService(process.env);

// TypeORM exige exactement un export DataSource dans ce fichier : seul le
// `export default` compte, un second export nommé fait échouer la CLI.
const AppDataSource = new DataSource({
  ...DATABASE_CONFIG_FACTORY(configService),
  // La CLI pilote les migrations elle-même : ne pas les rejouer au simple fait
  // de charger ce module.
  migrationsRun: false,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
});

export default AppDataSource;

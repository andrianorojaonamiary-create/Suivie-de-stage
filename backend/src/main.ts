import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

interface ExpressLayer {
  route?: {
    path: string;
    methods: Record<string, boolean | undefined>;
  };
  handle?: { stack?: ExpressLayer[] };
  regexp?: RegExp;
}

/**
 * Journalise les routes effectivement montées.
 *
 * Nest ne le fait pas nativement, et un décorateur mal placé est invisible
 * jusqu'au premier appel : c'est notamment le piège d'un @Get('enquete') déclaré
 * après un @Get(':id'), qui ne répond jamais parce que la chaîne est captée
 * comme un identifiant. Lire la pile du routeur au démarrage permet de vérifier
 * d'un coup d'œil que le chemin attendu existe.
 *
 * Dépend de l'implémentation Express (platform-express) : toute anomalie est
 * silencieuse, ce n'est qu'un outil de diagnostic.
 */
function logMountedRoutes(app: INestApplication) {
  const server = app.getHttpAdapter().getInstance();
  const stack: ExpressLayer[] | undefined =
    server?._router?.stack ?? server?.router?.stack;
  if (!stack) return;

  const routes: string[] = [];
  const walk = (layers: ExpressLayer[]) => {
    for (const layer of layers) {
      if (layer.route) {
        const methods = Object.entries(layer.route.methods)
          .filter(([, enabled]) => enabled)
          .map(([method]) => method.toUpperCase())
          .join(',');
        routes.push(`  ${methods.padEnd(7)} /api${layer.route.path}`);
      } else if (layer.handle?.stack) {
        walk(layer.handle.stack);
      }
    }
  };
  walk(stack);
  routes.sort();

  const logger = new Logger('Routes');
  logger.log(`${routes.length} routes montées :`);
  routes.forEach((route) => logger.log(route));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  logMountedRoutes(app);
}

void bootstrap();

import 'reflect-metadata';
import 'dotenv/config';
import { hash } from 'bcryptjs';
import { Role } from '../../users/enums/role.enum';
import { User } from '../../users/entities/user.entity';
import AppDataSource from '../data-source';

// Même coût que users.service.ts : bcrypt 12 rounds est la référence du projet.
const BCRYPT_ROUNDS = 12;

/**
 * Crée le premier compte ADMINISTRATEUR.
 *
 * Bootstrap contourne volontairement l'API : POST /api/users exige déjà le rôle
 * ADMINISTRATEUR, donc sur une base neuve ce seed est le seul moyen d'obtenir
 * un administrateur. Une fois qu'il en existe un, les suivants se créent par
 * POST /api/users ou PATCH /api/users/:id.
 *
 * Idempotent par défaut : si l'email existe déjà, le script ne fait rien et ne
 * remet jamais un mot de passe à plat par-dessus un compte existant. Ce
 * comportement protège le compte, mais laisse sans issue de secours un admin
 * dont le mot de passe a été perdu : c'est le rôle de --reset.
 *
 *   npm run seed:admin              crée le compte s'il est absent
 *   npm run seed:admin -- --reset   réécrit le mot de passe s'il existe déjà
 */
const RESET_FLAG = '--reset';
const resetRequested = process.argv.includes(RESET_FLAG);

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans backend/.env',
    );
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD doit contenir au moins 8 caractères.');
  }

  await AppDataSource.initialize();

  try {
    const usersRepository = AppDataSource.getRepository(User);

    const existing = await usersRepository.findOne({
      where: { email },
      select: { id: true, role: true },
    });

    if (existing) {
      if (!resetRequested) {
        console.log(
          `[seed:admin] ${email} existe déjà (rôle ${existing.role}) — aucune modification.`,
        );
        console.log(
          '[seed:admin] Mot de passe oublié ? Relancez avec : npm run seed:admin -- --reset',
        );
        return;
      }

      // tokenVersion repart à 0 : sans cela, les JWT émis avant le changement
      // resteraient acceptés après réécriture du mot de passe, et la
      // réinitialisation n'aurait aucun effet sur les sessions ouvertes.
      await usersRepository.update(existing.id, {
        motDePasse: await hash(password, BCRYPT_ROUNDS),
        tokenVersion: 0,
        actif: true,
      });
      console.log(
        `[seed:admin] Mot de passe de ${email} réécrit depuis ADMIN_PASSWORD (rôle ${existing.role}).`,
      );
      console.log(
        '[seed:admin] Les sessions ouvertes (tokenVersion) ont été invalidées.',
      );
      return;
    }

    const admin = usersRepository.create({
      nom: process.env.ADMIN_NOM?.trim() || 'Administrateur',
      prenom: process.env.ADMIN_PRENOM?.trim() || 'EMIT',
      email,
      motDePasse: await hash(password, BCRYPT_ROUNDS),
      role: Role.ADMINISTRATEUR,
      actif: true,
    });

    await usersRepository.save(admin);

    console.log(
      `[seed:admin] Compte ${email} créé avec le rôle ${Role.ADMINISTRATEUR}.`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(
    '[seed:admin] Échec :',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});

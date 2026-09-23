import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    try {
      this.transporter = this.buildTransporter();
    } catch {
      this.transporter = null;
    }
  }

  /**
   * Lève une erreur claire si la configuration SMTP est absente/incomplète,
   * afin de rendre le débogage du « mot de passe oublié » explicite.
   */
  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    if (!this.transporter) {
      throw new Error(
        'SMTP non configuré. Renseignez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et SMTP_FROM dans le fichier .env.',
      );
    }

    await this.transporter.sendMail({
      from: this.smtpConfig().from,
      to,
      subject: 'Votre code de réinitialisation — EMIT',
      html: this.buildTemplate(code),
    });
  }

  /**
   * Envoie un email aux administrateurs pour les notifier d'un nouvel inscrit
   */
  async sendNewUserNotificationEmail(to: string, userInfo: string): Promise<void> {
    if (!this.transporter) {
      throw new Error(
        'SMTP non configuré. Renseignez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et SMTP_FROM dans le fichier .env.',
      );
    }

    await this.transporter.sendMail({
      from: this.smtpConfig().from,
      to,
      subject: 'Nouvel inscrit sur la plateforme EMIT',
      html: this.buildNewUserTemplate(userInfo),
    });
  }

  private buildTransporter(): Transporter | null {
    const config = this.smtpConfig();

    if (!config.host || !config.user || !config.pass) {
      return null;
    }

    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  private smtpConfig(): MailConfig {
    const config = this.configService;

    return {
      host: config.get<string>('SMTP_HOST', ''),
      port: Number(config.get<string>('SMTP_PORT', '587')),
      secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
      user: config.get<string>('SMTP_USER', ''),
      pass: config.get<string>('SMTP_PASS', ''),
      from: config.get<string>('SMTP_FROM', ''),
    };
  }

  private buildTemplate(code: string): string {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-top: 4px solid #6BA9E6;">
        <div style="padding: 24px 32px; text-align: center;">
          <h2 style="color: #162449; margin: 0 0 8px;">Réinitialisation du mot de passe</h2>
          <p style="color: #444; line-height: 1.6;">
            Bonjour,<br/>
            Vous avez demandé la réinitialisation de votre mot de passe pour la plateforme de suivi de stages <strong>EMIT Fianarantsoa</strong>. Voici votre code de vérification :
          </p>
          <div style="display: inline-block; background: #E8F0FE; border: 2px dashed #6BA9E6; color: #162449; font-size: 34px; font-weight: 700; letter-spacing: 8px; padding: 14px 26px; border-radius: 10px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #444; line-height: 1.6;">
            Saisissez ce code sur la page « Mot de passe oublié » pour choisir un nouveau mot de passe.
          </p>
          <p style="color: #999; font-size: 13px; line-height: 1.5;">
            Ce code est valable <strong>15 minutes</strong>. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.
          </p>
        </div>
      </div>
    `;
  }

  private buildNewUserTemplate(userInfo: string): string {
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-top: 4px solid #27AE60;">
        <div style="padding: 24px 32px; text-align: center;">
          <h2 style="color: #162449; margin: 0 0 8px;">Nouvel inscrit sur EMIT</h2>
          <p style="color: #444; line-height: 1.6;">
            Bonjour,<br/>
            Un nouvel utilisateur vient de s'inscrire sur la plateforme de suivi de stages <strong>EMIT Fianarantsoa</strong>.
          </p>
          <div style="display: inline-block; background: #E8F8F0; border: 2px solid #27AE60; color: #162449; font-size: 16px; padding: 14px 26px; border-radius: 10px; margin: 20px 0; text-align: left;">
            ${userInfo}
          </div>
          <p style="color: #999; font-size: 13px; line-height: 1.5;">
            Cet email est envoyé automatiquement. Merci de ne pas y répondre.
          </p>
        </div>
      </div>
    `;
  }
}

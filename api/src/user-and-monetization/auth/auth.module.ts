// src/user-and-monetization/auth/auth.module.ts - NETFLIX-GRADE REFACTORED
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { VerificationToken, VerificationTokenSchema } from './schemas/verification-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './auth.controller';

// Services - Core
import { AuthService } from './auth.service';

// Services - Specialized (Netflix-style)
import { SessionService } from './services/session.service';
import { DeviceService } from './services/device.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { OtpService } from './services/otp.service';
import { VerificationService } from './services/verification.service';
import { TokenService } from './services/token.service';
import { LoginService } from './services/login.service';
import { RegistrationService } from './services/registration.service';
import { PasswordService } from './services/password.service';

// Strategies & Guards
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SubscriptionGuard } from './guards/subscription.guard';

// Schemas - Netflix-Grade Security
import { Session, SessionSchema } from './schemas/session.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { Device, DeviceSchema } from '../user/schemas/device.schema';

// External Modules
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    ConfigModule,

    // 🔐 NETFLIX-GRADE SCHEMAS
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: VerificationToken.name, schema: VerificationTokenSchema },
    ]),

    UserModule,

    // Fix circular dependencies
    forwardRef(() => RoleModule),
    forwardRef(() => SubscriptionModule),

    // 🔐 PASSPORT MODULE - REQUIRED FOR JWT STRATEGY
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10m' },
      }),
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: parseInt(config.get<string>('MAIL_PORT') || '587'),
          secure: config.get<string>('MAIL_SECURE') === 'true',
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"${config.get<string>('MAIL_FROM_NAME') || 'House Levi+'}" <${config.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, '../templates/emails'),
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
            extname: '.hbs',
          },
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    // Core Auth Service (Orchestrator)
    AuthService,
    JwtStrategy,

    // Guards
    JwtAuthGuard,
    RolesGuard,
    SubscriptionGuard,

    // 🔐 NETFLIX-GRADE INFRASTRUCTURE SERVICES
    SessionService,
    DeviceService,
    RefreshTokenService,
    OtpService,
    VerificationService,

    // 🆕 NETFLIX-GRADE SPECIALIZED SERVICES
    TokenService,
    LoginService,
    RegistrationService,
    PasswordService,
  ],

  exports: [
    // Auth Services
    AuthService,
    JwtStrategy,
    JwtModule,
    PassportModule,

    // Guards (so other modules can use them)
    JwtAuthGuard,
    RolesGuard,
    SubscriptionGuard,

    // Infrastructure Services
    SessionService,
    DeviceService,
    RefreshTokenService,
    OtpService,
    VerificationService,

    // Specialized Services
    TokenService,
    LoginService,
    RegistrationService,
    PasswordService,

    // Schemas
    MongooseModule,

    // External
    forwardRef(() => RoleModule),
  ],
})
export class AuthModule {}
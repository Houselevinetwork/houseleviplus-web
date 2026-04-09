import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { VerificationToken, VerificationTokenSchema } from './schemas/verification-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './auth.controller';

// Services - Core
import { AuthService } from './auth.service';

// Services - Specialized
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

// Schemas
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

    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: VerificationToken.name, schema: VerificationTokenSchema },
    ]),

    UserModule,
    forwardRef(() => RoleModule),
    forwardRef(() => SubscriptionModule),

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
          host: config.get<string>('MAIL_HOST') || 'smtp.gmail.com',
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
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    SubscriptionGuard,
    SessionService,
    DeviceService,
    RefreshTokenService,
    OtpService,
    VerificationService,
    TokenService,
    LoginService,
    RegistrationService,
    PasswordService,
  ],

  exports: [
    AuthService,
    JwtStrategy,
    JwtModule,
    PassportModule,
    JwtAuthGuard,
    RolesGuard,
    SubscriptionGuard,
    SessionService,
    DeviceService,
    RefreshTokenService,
    OtpService,
    VerificationService,
    TokenService,
    LoginService,
    RegistrationService,
    PasswordService,
    MongooseModule,
    forwardRef(() => RoleModule),
  ],
})
export class AuthModule {}
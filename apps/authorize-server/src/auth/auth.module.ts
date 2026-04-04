import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// Schemas
import { AuthorizationCode, AuthorizationCodeSchema } from './common/schemas/authorization-code.schema';
import { OAuthClient, OAuthClientSchema } from './common/schemas/oauth-client.schema';
import { User, UserSchema } from './common/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthorizationCode.name, schema: AuthorizationCodeSchema },
      { name: OAuthClient.name, schema: OAuthClientSchema },
      { name: User.name, schema: UserSchema }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-key',
      signOptions: { expiresIn: '1h' }
    })
  ]
})
export class AuthModule {}

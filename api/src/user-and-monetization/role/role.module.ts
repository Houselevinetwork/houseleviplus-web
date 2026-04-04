import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),

    PassportModule,

    // Fix circular dependency: AuthModule ↔ RoleModule
    forwardRef(() => AuthModule),
  ],

  controllers: [RoleController],

  providers: [RoleService],

  exports: [
    RoleService,
    // Export forwardRef so other modules (e.g., Auth) can resolve RoleService
    forwardRef(() => AuthModule),
  ],
})
export class RoleModule {}

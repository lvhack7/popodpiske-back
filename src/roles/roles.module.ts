import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from './model/role.model';
import { AdminRole } from './model/admin-role.model';

@Module({
  imports: [SequelizeModule.forFeature([Roles, AdminRole])],
  providers: [RolesService],
  exports: [RolesService],
  controllers: [RolesController]
})
export class RolesModule {}

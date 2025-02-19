import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { RefreshToken } from './model/refresh-token.model';

@Module({
  imports: [SequelizeModule.forFeature([User, RefreshToken])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

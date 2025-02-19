import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { RefreshToken } from 'src/users/model/refresh-token.model';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { RolesModule } from 'src/roles/roles.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [SequelizeModule.forFeature([RefreshToken]), JwtModule.register({}), UsersModule, SmsModule, RolesModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy]
})
export class AuthModule {}

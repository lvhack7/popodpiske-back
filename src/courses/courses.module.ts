import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from './model/course.model';
import { LinksModule } from 'src/links/links.module';

@Module({
  imports: [SequelizeModule.forFeature([Course]), LinksModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService]
})
export class CoursesModule {}

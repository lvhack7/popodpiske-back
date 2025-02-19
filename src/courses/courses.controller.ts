import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';

@Controller('courses')
export class CoursesController {

    constructor(
        private readonly courseService: CoursesService
    ) {}

    @Roles(Role.Admin)
    @Post()
    async createCourse(@Body() dto: CreateCourseDto) {
        return await this.courseService.create(dto);
    }

    @Roles(Role.Admin, Role.Manager)
    @Get()
    async getCourses() {
        return await this.courseService.findAll();
    }

    @Delete(':id')
    async deleteCourse(@Param('id') id: number) {
        return await this.courseService.delete(id);
    }

}

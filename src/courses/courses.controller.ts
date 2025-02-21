import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { UpdateCourseDto } from './dto/update-course.dto';

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

    @Roles(Role.Admin)
    @Put()
    async updateCourse(@Body() dto: UpdateCourseDto) {
        return await this.courseService.updateCourse(dto)
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

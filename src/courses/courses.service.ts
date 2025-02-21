import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Course } from './model/course.model';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course)
        private readonly courseModel: typeof Course,
    ) {}

    async create(dto: CreateCourseDto): Promise<Course> {
        const foundCourse = await this.courseModel.findOne({ where: { courseName: dto.courseName } });
        if (foundCourse) {
            throw new NotFoundException('Курс с таким названием уже существует');
        }

        const course = await this.courseModel.create(dto);
        return course
    }

    async findAll(): Promise<Course[]> {
        return this.courseModel.findAll({ order: [['id', 'ASC']],});
    }

    async findOne(id: number): Promise<Course> {
        const course = await this.courseModel.findByPk(id);
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        return course;
    }

    async delete(id: number): Promise<void> {
        const course = await this.findOne(id);
        await course.destroy();
    }

    async updateCourse(dto: UpdateCourseDto) {
        const course = await this.courseModel.findByPk(dto.id)
        if (!course) {
            throw new BadRequestException("Курс не найден")
        }

        course.courseName = dto.courseName
        course.totalPrice = dto.totalPrice

        await course.save()
    }
}
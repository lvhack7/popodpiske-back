import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Курсы')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courseService: CoursesService) {}

  @Roles(Role.Admin)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание курса', description: 'Создает новый курс с заданным названием и стоимостью.' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Курс успешно создан.' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или неверные входные данные.' })
  async createCourse(@Body() dto: CreateCourseDto) {
    return await this.courseService.create(dto);
  }

  @Roles(Role.Admin)
  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление курса', description: 'Обновляет данные курса.' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Курс успешно обновлен.' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или неверные входные данные.' })
  async updateCourse(@Body() dto: UpdateCourseDto) {
    return await this.courseService.updateCourse(dto);
  }

  @Roles(Role.Admin, Role.Manager)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение курсов', description: 'Возвращает список всех курсов.' })
  @ApiResponse({ status: 200, description: 'Список курсов успешно получен.' })
  async getCourses() {
    return await this.courseService.findAll();
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление курса', description: 'Удаляет курс по указанному идентификатору.' })
  @ApiParam({ name: 'id', description: 'Идентификатор курса', type: Number })
  @ApiResponse({ status: 200, description: 'Курс успешно удален.' })
  @ApiResponse({ status: 404, description: 'Курс не найден.' })
  async deleteCourse(@Param('id') id: number) {
    return await this.courseService.delete(id);
  }
}
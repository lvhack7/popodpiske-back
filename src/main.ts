import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AuthAccessGuard } from './common/guards/auth-access.guard';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector)

  app.use('/docs', basicAuth({
    challenge: true,
    users: {
      'admin': 'popodpiskeDocs2025!', // change these as needed
    },
  }));

  // Build the Swagger configuration:
  const config = new DocumentBuilder()
    .setTitle('Popodpiske API')
    .setDescription('Описание API')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }, 'access-token') // The second parameter is an optional name for the security scheme
    .build();

  // Create the Swagger document:
  const document = SwaggerModule.createDocument(app, config);
  // Serve Swagger UI at /api-docs:
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-type'],
    origin: ['https://popodpiske.com', 'https://admin.popodpiske.com'],
		credentials: true,
  })
  
  app.use(cookieParser());
  app.useGlobalGuards(new AuthAccessGuard(reflector))
  app.useGlobalGuards(new RolesGuard(reflector))
  app.useGlobalPipes(new ValidationPipe())

  console.log('Node version at runtime:', process.version);
  await app.listen(5002, () => {console.log("Server started on port 5002")});
}
bootstrap();

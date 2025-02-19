import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { RolesGuard } from './common/guards/roles.guard';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AuthAccessGuard } from './common/guards/auth-access.guard';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector)

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

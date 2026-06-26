import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import cors from '@fastify/cors'
import { AppModule } from './app.module'
import { PinoAppLogger } from './logger/pino-logger'
import { RequestLoggingInterceptor } from './logger/request-logging.interceptor'

async function bootstrap() {
  const logger = new PinoAppLogger()
  const corsOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger
    }
  )
  app.useLogger(logger)

  await app.register(cors, {
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true
  })

  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )
  app.useGlobalInterceptors(new RequestLoggingInterceptor(logger))

  const port = Number(process.env.PORT || 3002)
  await app.listen(port, '0.0.0.0')
  logger.log(`API server started on port ${port}`, 'Bootstrap')
}

void bootstrap()

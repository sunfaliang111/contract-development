import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { catchError, tap, throwError } from 'rxjs'
import { PinoAppLogger } from './pino-logger'

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly appLogger: PinoAppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const startedAt = Date.now()

    return next.handle().pipe(
      tap(() => {
        this.appLogger.instance.info(
          {
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt
          },
          'request completed'
        )
      }),
      catchError((error) => {
        this.appLogger.instance.error(
          {
            method: request.method,
            url: request.url,
            statusCode: error?.status || 500,
            durationMs: Date.now() - startedAt,
            error: error?.message
          },
          'request failed'
        )
        return throwError(() => error)
      })
    )
  }
}

import { LoggerService } from '@nestjs/common'
import fs from 'node:fs'
import path from 'node:path'
import { Writable } from 'node:stream'
import pino, { Logger } from 'pino'

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const createPinoInstance = () => {
  const isLocal = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
  const shouldWriteFile = process.env.LOG_TO_FILE === 'true' || !isLocal

  if (!shouldWriteFile) {
    return pino({
      level: process.env.LOG_LEVEL || 'info',
      timestamp: pino.stdTimeFunctions.isoTime
    })
  }

  const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
  const destination = new DailyLogStream(logDir)

  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      timestamp: pino.stdTimeFunctions.isoTime
    },
    destination
  )
}

class DailyLogStream extends Writable {
  private currentDate = ''
  private stream: fs.WriteStream | null = null

  constructor(private readonly logDir: string) {
    super()
    fs.mkdirSync(logDir, { recursive: true })
  }

  _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    try {
      this.ensureStream()
      this.stream?.write(chunk, encoding, callback)
    } catch (error) {
      callback(error as Error)
    }
  }

  private ensureStream() {
    const today = formatDate(new Date())
    if (this.stream && this.currentDate === today) {
      return
    }

    this.stream?.end()
    this.currentDate = today
    this.stream = fs.createWriteStream(path.join(this.logDir, `${today}.log`), {
      flags: 'a'
    })
  }
}

export class PinoAppLogger implements LoggerService {
  constructor(private readonly logger: Logger = createPinoInstance()) {}

  get instance() {
    return this.logger
  }

  log(message: unknown, context?: string) {
    this.logger.info({ context }, String(message))
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error({ context, trace }, String(message))
  }

  warn(message: unknown, context?: string) {
    this.logger.warn({ context }, String(message))
  }

  debug(message: unknown, context?: string) {
    this.logger.debug({ context }, String(message))
  }

  verbose(message: unknown, context?: string) {
    this.logger.trace({ context }, String(message))
  }
}

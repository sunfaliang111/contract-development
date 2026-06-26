import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CodesService } from './codes.service'

@Controller('codes')
@UseGuards(JwtAuthGuard)
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Get()
  findByTypes(@Query('types') types = '') {
    return this.codesService.findByTypes(types.split(','))
  }
}

import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { JwtPayload } from '../auth/types/jwt-payload.type'
import { CreatePersonnelDto } from './dto/create-personnel.dto'
import { CreateResumeDto } from './dto/create-resume.dto'
import { UpdatePersonnelDto } from './dto/update-personnel.dto'
import { PersonnelService } from './personnel.service'
import { ResumesService } from './resumes.service'
import { PersonnelSearchField } from './types/personnel-search-field.type'

@Controller('personnel')
@UseGuards(JwtAuthGuard)
export class PersonnelController {
  constructor(
    private readonly personnelService: PersonnelService,
    private readonly resumesService: ResumesService
  ) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchField') searchField?: PersonnelSearchField,
    @Query('keyword') keyword?: string,
    @Query('projectId') projectId?: string
  ) {
    return this.personnelService.findAll({
      page: Number(page || 1),
      limit: Number(limit || 10),
      searchField,
      keyword,
      projectId
    })
  }

  @Post()
  create(@Body() createPersonnelDto: CreatePersonnelDto, @CurrentUser() user: JwtPayload) {
    return this.personnelService.create(createPersonnelDto, user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonnelDto: UpdatePersonnelDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.personnelService.update(id, updatePersonnelDto, user.sub)
  }

  @Patch(':id/assignment')
  updateAssignment(
    @Param('id') id: string,
    @Body('projectId') projectId: string | null,
    @CurrentUser() user: JwtPayload
  ) {
    return this.personnelService.updateAssignment(id, projectId || null, user.sub)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personnelService.remove(id)
  }

  @Get(':id/resumes')
  findResumes(@Param('id') id: string) {
    return this.resumesService.findAll(id)
  }

  @Post(':id/resumes')
  createResume(@Param('id') id: string, @Body() createResumeDto: CreateResumeDto) {
    return this.resumesService.create(id, createResumeDto)
  }

  @Get(':id/resumes/:resumeId/preview')
  @Header('Cache-Control', 'private, max-age=60')
  async previewResume(
    @Param('id') id: string,
    @Param('resumeId') resumeId: string,
    @Res() reply: FastifyReply
  ) {
    const file = await this.resumesService.getFile(id, resumeId)
    reply.header('Content-Type', file.contentType)
    reply.header('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
    if (file.fileSize) {
      reply.header('Content-Length', String(file.fileSize))
    }
    return reply.send(file.stream)
  }

  @Get(':id/resumes/:resumeId/download')
  async downloadResume(
    @Param('id') id: string,
    @Param('resumeId') resumeId: string,
    @Res() reply: FastifyReply
  ) {
    const file = await this.resumesService.getFile(id, resumeId)
    reply.header('Content-Type', file.contentType)
    reply.header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
    if (file.fileSize) {
      reply.header('Content-Length', String(file.fileSize))
    }
    return reply.send(file.stream)
  }

  @Delete(':id/resumes/:resumeId')
  removeResume(@Param('id') id: string, @Param('resumeId') resumeId: string) {
    return this.resumesService.remove(id, resumeId)
  }
}

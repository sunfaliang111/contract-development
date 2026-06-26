import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { JwtPayload } from '../auth/types/jwt-payload.type'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectsService } from './projects.service'
import { ProjectSearchField } from './types/project-search-field.type'

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchField') searchField?: ProjectSearchField,
    @Query('keyword') keyword?: string,
    @Query('customerId') customerId?: string
  ) {
    return this.projectsService.findAll({
      page: Number(page || 1),
      limit: Number(limit || 10),
      searchField,
      keyword,
      customerId
    })
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: JwtPayload) {
    return this.projectsService.create(createProjectDto, user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.projectsService.update(id, updateProjectDto, user.sub)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id)
  }
}

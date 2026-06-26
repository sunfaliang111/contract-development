import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { JwtPayload } from '../auth/types/jwt-payload.type'
import { CreatePersonnelDto } from './dto/create-personnel.dto'
import { UpdatePersonnelDto } from './dto/update-personnel.dto'
import { PersonnelService } from './personnel.service'
import { PersonnelSearchField } from './types/personnel-search-field.type'

@Controller('personnel')
@UseGuards(JwtAuthGuard)
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

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
}

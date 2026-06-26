import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { Personnel } from '../personnel/personnel.entity'
import { ProjectJobCategory } from './project-job-category.entity'
import { ProjectPersonnel } from './project-personnel.entity'
import { Project } from './project.entity'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectJobCategory, ProjectPersonnel, Personnel]), UsersModule],
  controllers: [ProjectsController],
  providers: [ProjectsService]
})
export class ProjectsModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { ProjectPersonnel } from '../projects/project-personnel.entity'
import { PersonnelJobCategory } from './personnel-job-category.entity'
import { PersonnelController } from './personnel.controller'
import { Personnel } from './personnel.entity'
import { PersonnelService } from './personnel.service'
import { Resume } from './resume.entity'
import { ResumesService } from './resumes.service'

@Module({
  imports: [TypeOrmModule.forFeature([Personnel, PersonnelJobCategory, ProjectPersonnel, Resume]), UsersModule],
  controllers: [PersonnelController],
  providers: [PersonnelService, ResumesService]
})
export class PersonnelModule {}

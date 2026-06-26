import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '../users/users.module'
import { ProjectPersonnel } from '../projects/project-personnel.entity'
import { PersonnelJobCategory } from './personnel-job-category.entity'
import { PersonnelController } from './personnel.controller'
import { Personnel } from './personnel.entity'
import { PersonnelService } from './personnel.service'

@Module({
  imports: [TypeOrmModule.forFeature([Personnel, PersonnelJobCategory, ProjectPersonnel]), UsersModule],
  controllers: [PersonnelController],
  providers: [PersonnelService]
})
export class PersonnelModule {}

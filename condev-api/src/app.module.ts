import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { Code } from './codes/code.entity'
import { CodesModule } from './codes/codes.module'
import { CustomersModule } from './customers/customers.module'
import { Customer } from './customers/customer.entity'
import { PersonnelJobCategory } from './personnel/personnel-job-category.entity'
import { Personnel } from './personnel/personnel.entity'
import { PersonnelModule } from './personnel/personnel.module'
import { Resume } from './personnel/resume.entity'
import { ProjectJobCategory } from './projects/project-job-category.entity'
import { ProjectPersonnel } from './projects/project-personnel.entity'
import { Project } from './projects/project.entity'
import { ProjectsModule } from './projects/projects.module'
import { UsersModule } from './users/users.module'
import { User } from './users/user.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'condev'),
        password: config.get<string>('DB_PASSWORD', 'condev_password'),
        database: config.get<string>('DB_DATABASE', 'condev'),
        entities: [
          User,
          Customer,
          Code,
          Project,
          ProjectJobCategory,
          ProjectPersonnel,
          Personnel,
          PersonnelJobCategory,
          Resume
        ],
        // Keep disabled for local data safety. Schema changes should be applied explicitly.
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true'
      })
    }),
    UsersModule,
    CodesModule,
    CustomersModule,
    ProjectsModule,
    PersonnelModule,
    AuthModule
  ],
  controllers: [AppController]
})
export class AppModule {}

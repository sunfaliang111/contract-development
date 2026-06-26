import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Personnel } from '../personnel/personnel.entity'
import { UsersService } from '../users/users.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { UpdateProjectDto } from './dto/update-project.dto'
import { ProjectJobCategory } from './project-job-category.entity'
import { ProjectPersonnel } from './project-personnel.entity'
import { Project } from './project.entity'
import { ProjectSearchField } from './types/project-search-field.type'

type FindProjectsParams = {
  page: number
  limit: number
  searchField?: ProjectSearchField
  keyword?: string
  customerId?: string
}

const searchColumnMap: Record<ProjectSearchField, string> = {
  projectName: 'project.projectName',
  projectOverview: 'project.projectOverview',
  station: 'project.station',
  representativeSalesName: 'project.representativeSalesName'
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const normalizeAmount = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectJobCategory)
    private readonly projectJobCategoriesRepository: Repository<ProjectJobCategory>,
    @InjectRepository(ProjectPersonnel)
    private readonly projectPersonnelRepository: Repository<ProjectPersonnel>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    private readonly usersService: UsersService
  ) {}

  async findAll(params: FindProjectsParams) {
    const limit = Number.isFinite(params.limit)
      ? Math.min(Math.max(Math.trunc(params.limit), 1), 100)
      : 10
    const page = Number.isFinite(params.page) ? Math.max(Math.trunc(params.page), 1) : 1
    const keyword = params.keyword?.trim()
    const customerId = params.customerId?.trim()

    const query = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.jobCategories', 'jobCategories')
      .orderBy('project.registeredAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (customerId) {
      query.andWhere('project.customerId = :customerId', { customerId })
    }

    if (keyword && params.searchField && searchColumnMap[params.searchField]) {
      query.andWhere(`${searchColumnMap[params.searchField]} LIKE :keyword`, {
        keyword: `%${keyword}%`
      })
    }

    const [items, total] = await query.getManyAndCount()
    const lastPage = Math.max(Math.ceil(total / limit), 1)

    return {
      items: await Promise.all(items.map((item) => this.toResponse(item))),
      total,
      page,
      limit,
      lastPage
    }
  }

  async findOne(id: string) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: { jobCategories: true }
    })

    if (!project) {
      throw new NotFoundException('案件情報が見つかりません。')
    }

    return this.toResponse(project)
  }

  async create(createProjectDto: CreateProjectDto, currentUserId: string) {
    const user = await this.usersService.findById(currentUserId)

    if (!user) {
      throw new NotFoundException('ユーザー情報が見つかりません。')
    }

    const project = this.projectsRepository.create({
      ...this.toEntityValues(createProjectDto),
      id: await this.generateProjectId(),
      registeredBy: user.userName,
      updatedBy: user.userName
    })

    const saved = await this.projectsRepository.save(project)
    await this.replaceJobCategories(saved.id, createProjectDto.jobCategoryCodes)

    return this.findOne(saved.id)
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, updatedByUserId: string) {
    const project = await this.projectsRepository.findOne({ where: { id } })
    const user = await this.usersService.findById(updatedByUserId)

    if (!project) {
      throw new NotFoundException('案件情報が見つかりません。')
    }

    if (!user) {
      throw new NotFoundException('ユーザー情報が見つかりません。')
    }

    Object.assign(project, {
      ...this.toEntityValues(updateProjectDto),
      updatedBy: user.userName
    })

    await this.projectsRepository.save(project)
    await this.replaceJobCategories(id, updateProjectDto.jobCategoryCodes)

    return this.findOne(id)
  }

  async remove(id: string) {
    const project = await this.projectsRepository.findOne({ where: { id } })

    if (!project) {
      throw new NotFoundException('案件情報が見つかりません。')
    }

    await this.personnelRepository.update({ projectId: id }, { projectId: null })
    await this.projectPersonnelRepository.delete({ projectId: id })
    await this.projectJobCategoriesRepository.delete({ projectId: id })
    await this.projectsRepository.delete({ id })

    return { deleted: true }
  }

  private toEntityValues(dto: UpdateProjectDto) {
    return {
      projectName: dto.projectName,
      projectOverview: dto.projectOverview,
      projectDetail: dto.projectDetail || null,
      skills: dto.skills || null,
      ageFrom: dto.ageFrom ?? null,
      ageTo: dto.ageTo ?? null,
      foreignAcceptanceCode: dto.foreignAcceptanceCode || 'ACCEPTABLE',
      billingRate: normalizeAmount(dto.billingRate),
      unitPaymentPrice: normalizeAmount(dto.unitPaymentPrice),
      numberOfInterviews: dto.numberOfInterviews ?? 1,
      commercialFlowCode: dto.commercialFlowCode,
      station: dto.station || null,
      beginDate: dto.beginDate,
      endDate: dto.endDate || null,
      representativeSalesName: dto.representativeSalesName || null,
      customerId: dto.customerId || null,
      remarks: dto.remarks || null
    }
  }

  private async replaceJobCategories(projectId: string, jobCategoryCodes: string[]) {
    await this.projectJobCategoriesRepository.delete({ projectId })

    const uniqueCodes = Array.from(new Set(jobCategoryCodes || [])).filter(Boolean)
    if (uniqueCodes.length === 0) {
      return
    }

    await this.projectJobCategoriesRepository.save(
      uniqueCodes.map((jobCategoryCode) =>
        this.projectJobCategoriesRepository.create({
          projectId,
          jobCategoryCode,
          remarks: null
        })
      )
    )
  }

  private async generateProjectId() {
    const prefix = `PRJ-${formatDate(new Date())}-`
    const latest = await this.projectsRepository
      .createQueryBuilder('project')
      .where('project.id LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('project.id', 'DESC')
      .getOne()

    const latestSequence = latest ? Number(latest.id.replace(prefix, '')) : 0
    return `${prefix}${String(latestSequence + 1).padStart(4, '0')}`
  }

  private async toResponse(project: Project) {
    const assignedPersonnelCount = await this.personnelRepository.count({
      where: { projectId: project.id }
    })

    return {
      ...project,
      assignedPersonnelCount,
      jobCategoryCodes: (project.jobCategories || []).map((item) => item.jobCategoryCode)
    }
  }
}

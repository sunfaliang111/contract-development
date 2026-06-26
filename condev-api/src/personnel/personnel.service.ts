import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectPersonnel } from '../projects/project-personnel.entity'
import { UsersService } from '../users/users.service'
import { CreatePersonnelDto } from './dto/create-personnel.dto'
import { UpdatePersonnelDto } from './dto/update-personnel.dto'
import { PersonnelJobCategory } from './personnel-job-category.entity'
import { Personnel } from './personnel.entity'
import { PersonnelSearchField } from './types/personnel-search-field.type'

type FindPersonnelParams = {
  page: number
  limit: number
  searchField?: PersonnelSearchField
  keyword?: string
  projectId?: string
}

const searchColumnMap: Record<PersonnelSearchField, string> = {
  personnelName: 'personnel.personnelName',
  skills: 'personnel.skills',
  station: 'personnel.station',
  representativeSalesName: 'personnel.representativeSalesName'
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
export class PersonnelService {
  constructor(
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>,
    @InjectRepository(PersonnelJobCategory)
    private readonly personnelJobCategoriesRepository: Repository<PersonnelJobCategory>,
    @InjectRepository(ProjectPersonnel)
    private readonly projectPersonnelRepository: Repository<ProjectPersonnel>,
    private readonly usersService: UsersService
  ) {}

  async findAll(params: FindPersonnelParams) {
    const limit = Number.isFinite(params.limit)
      ? Math.min(Math.max(Math.trunc(params.limit), 1), 100)
      : 10
    const page = Number.isFinite(params.page) ? Math.max(Math.trunc(params.page), 1) : 1
    const keyword = params.keyword?.trim()
    const projectId = params.projectId?.trim()

    const query = this.personnelRepository
      .createQueryBuilder('personnel')
      .leftJoinAndSelect('personnel.jobCategories', 'jobCategories')
      .orderBy('personnel.registeredAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (projectId) {
      query.andWhere('personnel.projectId = :projectId', { projectId })
    }

    if (keyword && params.searchField && searchColumnMap[params.searchField]) {
      query.andWhere(`${searchColumnMap[params.searchField]} LIKE :keyword`, {
        keyword: `%${keyword}%`
      })
    }

    const [items, total] = await query.getManyAndCount()
    const lastPage = Math.max(Math.ceil(total / limit), 1)

    return {
      items: items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
      lastPage
    }
  }

  async findOne(id: string) {
    const personnel = await this.personnelRepository.findOne({
      where: { id },
      relations: { jobCategories: true }
    })

    if (!personnel) {
      throw new NotFoundException('要員情報が見つかりません。')
    }

    return this.toResponse(personnel)
  }

  async create(createPersonnelDto: CreatePersonnelDto, currentUserId: string) {
    const user = await this.usersService.findById(currentUserId)

    if (!user) {
      throw new NotFoundException('ユーザー情報が見つかりません。')
    }

    const personnel = this.personnelRepository.create({
      ...this.toEntityValues(createPersonnelDto),
      id: await this.generatePersonnelId(),
      registeredBy: user.userName,
      updatedBy: user.userName
    })

    const saved = await this.personnelRepository.save(personnel)
    await this.replaceJobCategories(saved.id, createPersonnelDto.jobCategoryCodes)

    return this.findOne(saved.id)
  }

  async update(id: string, updatePersonnelDto: UpdatePersonnelDto, updatedByUserId: string) {
    const personnel = await this.personnelRepository.findOne({ where: { id } })
    const user = await this.usersService.findById(updatedByUserId)

    if (!personnel) {
      throw new NotFoundException('要員情報が見つかりません。')
    }

    if (!user) {
      throw new NotFoundException('ユーザー情報が見つかりません。')
    }

    Object.assign(personnel, {
      ...this.toEntityValues(updatePersonnelDto),
      updatedBy: user.userName
    })

    await this.personnelRepository.save(personnel)
    await this.replaceJobCategories(id, updatePersonnelDto.jobCategoryCodes)

    return this.findOne(id)
  }

  async updateAssignment(id: string, projectId: string | null, updatedByUserId: string) {
    const personnel = await this.personnelRepository.findOne({ where: { id } })
    const user = await this.usersService.findById(updatedByUserId)

    if (!personnel) {
      throw new NotFoundException('要員情報が見つかりません。')
    }

    if (!user) {
      throw new NotFoundException('ユーザー情報が見つかりません。')
    }

    personnel.projectId = projectId || null
    personnel.updatedBy = user.userName
    await this.personnelRepository.save(personnel)

    return this.findOne(id)
  }

  async remove(id: string) {
    const personnel = await this.personnelRepository.findOne({ where: { id } })

    if (!personnel) {
      throw new NotFoundException('要員情報が見つかりません。')
    }

    await this.projectPersonnelRepository.delete({ personnelId: id })
    await this.personnelJobCategoriesRepository.delete({ personnelId: id })
    await this.personnelRepository.delete({ id })

    return { deleted: true }
  }

  private toEntityValues(dto: UpdatePersonnelDto) {
    return {
      personnelName: dto.personnelName,
      personnelNameKana: dto.personnelNameKana || null,
      personnelNameDisplay: dto.personnelNameDisplay || null,
      contractTypeCode: dto.contractTypeCode,
      affiliation: dto.affiliation || null,
      skills: dto.skills,
      birthDate: dto.birthDate,
      sexCode: dto.sexCode,
      nationalityCode: dto.nationalityCode || 'JAPANESE',
      price: normalizeAmount(dto.price) || '0',
      station: dto.station || null,
      startDate: dto.startDate || null,
      representativeSalesName: dto.representativeSalesName || null,
      availabilityCode: dto.availabilityCode || 'AVAILABLE',
      projectId: dto.projectId || null,
      remarks: dto.remarks || null
    }
  }

  private async replaceJobCategories(personnelId: string, jobCategoryCodes: string[]) {
    await this.personnelJobCategoriesRepository.delete({ personnelId })

    const uniqueCodes = Array.from(new Set(jobCategoryCodes || [])).filter(Boolean)
    if (uniqueCodes.length === 0) {
      return
    }

    await this.personnelJobCategoriesRepository.save(
      uniqueCodes.map((jobCategoryCode) =>
        this.personnelJobCategoriesRepository.create({
          personnelId,
          jobCategoryCode,
          remarks: null
        })
      )
    )
  }

  private async generatePersonnelId() {
    const prefix = `PER-${formatDate(new Date())}-`
    const latest = await this.personnelRepository
      .createQueryBuilder('personnel')
      .where('personnel.id LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('personnel.id', 'DESC')
      .getOne()

    const latestSequence = latest ? Number(latest.id.replace(prefix, '')) : 0
    return `${prefix}${String(latestSequence + 1).padStart(4, '0')}`
  }

  private toResponse(personnel: Personnel) {
    return {
      ...personnel,
      jobCategoryCodes: (personnel.jobCategories || []).map((item) => item.jobCategoryCode)
    }
  }
}

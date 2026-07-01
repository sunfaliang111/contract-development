import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { createReadStream } from 'fs'
import { mkdir, stat, unlink, writeFile } from 'fs/promises'
import { basename, extname, join, resolve } from 'path'
import { IsNull, Repository } from 'typeorm'
import { CreateResumeDto } from './dto/create-resume.dto'
import { Personnel } from './personnel.entity'
import { Resume } from './resume.entity'

const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx'])
const maxFileSize = 20 * 1024 * 1024

@Injectable()
export class ResumesService {
  private readonly storageRoot = resolve(process.env.RESUME_STORAGE_DIR || join(process.cwd(), 'storage', 'resumes'))

  constructor(
    @InjectRepository(Resume)
    private readonly resumesRepository: Repository<Resume>,
    @InjectRepository(Personnel)
    private readonly personnelRepository: Repository<Personnel>
  ) {}

  async findAll(engineerId: string) {
    await this.ensurePersonnel(engineerId)
    const resumes = await this.resumesRepository.find({
      where: { engineerId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' }
    })
    return resumes.map((resume) => this.toResponse(resume))
  }

  async create(engineerId: string, dto: CreateResumeDto) {
    await this.ensurePersonnel(engineerId)

    const originalFileName = basename(dto.fileName).replace(/[^\w.\-()\u3040-\u30ff\u3400-\u9fff]/g, '_')
    const extension = extname(originalFileName).toLowerCase()
    if (!allowedExtensions.has(extension)) {
      throw new BadRequestException('PDF、Word、Excelのファイルのみ登録できます。')
    }

    const fileBuffer = Buffer.from(dto.contentBase64, 'base64')
    if (fileBuffer.length === 0 || fileBuffer.length > maxFileSize) {
      throw new BadRequestException('ファイルサイズは1バイト以上20MB以下にしてください。')
    }

    const id = randomUUID()
    const version = await this.nextVersion(engineerId)
    const engineerDir = join(this.storageRoot, engineerId)
    await mkdir(engineerDir, { recursive: true })

    const storedFileName = `${id}${extension}`
    const storagePath = join(engineerDir, storedFileName)
    await writeFile(storagePath, fileBuffer)

    const resume = this.resumesRepository.create({
      id,
      engineerId,
      title: dto.title?.trim() || originalFileName,
      version,
      summary: null,
      fileUrl: `/api/personnel/${engineerId}/resumes/${id}/preview`,
      fileName: originalFileName,
      contentType: dto.contentType,
      fileSize: String(fileBuffer.length),
      storagePath,
      isCurrent: version === 1
    })

    const saved = await this.resumesRepository.save(resume)
    return this.toResponse(saved)
  }

  async getFile(engineerId: string, resumeId: string) {
    const resume = await this.findResume(engineerId, resumeId)
    if (!resume.storagePath) {
      throw new NotFoundException('経歴書ファイルが見つかりません。')
    }

    await stat(resume.storagePath)
    return {
      stream: createReadStream(resume.storagePath),
      fileName: resume.fileName || `${resume.id}.bin`,
      contentType: resume.contentType || 'application/octet-stream',
      fileSize: resume.fileSize ? Number(resume.fileSize) : undefined
    }
  }

  async remove(engineerId: string, resumeId: string) {
    const resume = await this.findResume(engineerId, resumeId)
    resume.deletedAt = new Date()
    await this.resumesRepository.save(resume)

    if (resume.storagePath) {
      await unlink(resume.storagePath).catch(() => undefined)
    }

    return { success: true }
  }

  private async ensurePersonnel(engineerId: string) {
    const personnel = await this.personnelRepository.findOne({ where: { id: engineerId } })
    if (!personnel) {
      throw new NotFoundException('要員情報が見つかりません。')
    }
  }

  private async findResume(engineerId: string, resumeId: string) {
    const resume = await this.resumesRepository.findOne({
      where: { id: resumeId, engineerId, deletedAt: IsNull() }
    })
    if (!resume) {
      throw new NotFoundException('経歴書情報が見つかりません。')
    }
    return resume
  }

  private async nextVersion(engineerId: string) {
    const result = await this.resumesRepository
      .createQueryBuilder('resume')
      .select('MAX(resume.version)', 'maxVersion')
      .where('resume.engineerId = :engineerId', { engineerId })
      .getRawOne<{ maxVersion: string | null }>()

    return Number(result?.maxVersion || 0) + 1
  }

  private toResponse(resume: Resume) {
    return {
      id: resume.id,
      engineerId: resume.engineerId,
      title: resume.title,
      version: resume.version,
      fileName: resume.fileName,
      contentType: resume.contentType,
      fileSize: resume.fileSize ? Number(resume.fileSize) : 0,
      isCurrent: resume.isCurrent,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    }
  }
}

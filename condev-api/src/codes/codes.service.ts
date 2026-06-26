import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { Code } from './code.entity'
import { defaultCodes } from './default-codes'

@Injectable()
export class CodesService implements OnModuleInit {
  constructor(
    @InjectRepository(Code)
    private readonly codesRepository: Repository<Code>
  ) {}

  async onModuleInit() {
    try {
      await this.seedDefaults()
    } catch {
      // The schema may be managed manually with database/schema.sql while DB_SYNCHRONIZE=false.
    }
  }

  async seedDefaults() {
    for (const item of defaultCodes) {
      const exists = await this.codesRepository.findOne({
        where: { codeType: item.codeType, code: item.code }
      })

      if (!exists) {
        await this.codesRepository.save(
          this.codesRepository.create({
            ...item,
            codeValueKana: null,
            isActive: true,
            remarks: null,
            registeredBy: 'system',
            updatedBy: 'system'
          })
        )
      }
    }
  }

  async findByTypes(codeTypes: string[]) {
    const normalizedTypes = codeTypes.map((type) => type.trim()).filter(Boolean)
    const codes = await this.codesRepository.find({
      where: {
        codeType: In(normalizedTypes),
        isActive: true
      },
      order: {
        codeType: 'ASC',
        displayOrder: 'ASC',
        code: 'ASC'
      }
    })

    return normalizedTypes.reduce<Record<string, Code[]>>((result, type) => {
      result[type] = codes.filter((code) => code.codeType === type)
      return result
    }, {})
  }
}

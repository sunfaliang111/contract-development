import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator'

export class UpdatePersonnelDto {
  @IsString()
  @MaxLength(256)
  personnelName!: string

  @IsOptional()
  @IsString()
  @MaxLength(256)
  personnelNameKana?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(256)
  personnelNameDisplay?: string | null

  @IsString()
  @MaxLength(32)
  contractTypeCode!: string

  @IsOptional()
  @IsString()
  @MaxLength(256)
  affiliation?: string | null

  @IsString()
  skills!: string

  @IsArray()
  @IsString({ each: true })
  jobCategoryCodes!: string[]

  @IsDateString()
  birthDate!: string

  @IsString()
  @MaxLength(32)
  sexCode!: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  nationalityCode?: string | null

  @IsOptional()
  price?: number | string | null

  @IsOptional()
  @IsString()
  @MaxLength(128)
  station?: string | null

  @IsOptional()
  @IsDateString()
  startDate?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(128)
  representativeSalesName?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(32)
  availabilityCode?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(36)
  projectId?: string | null

  @IsOptional()
  @IsString()
  remarks?: string | null
}

import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator'

export class UpdateProjectDto {
  @IsString()
  @MaxLength(256)
  projectName!: string

  @IsString()
  projectOverview!: string

  @IsOptional()
  @IsString()
  projectDetail?: string | null

  @IsOptional()
  @IsString()
  skills?: string | null

  @IsArray()
  @IsString({ each: true })
  jobCategoryCodes!: string[]

  @IsOptional()
  @IsInt()
  @Min(0)
  ageFrom?: number | null

  @IsOptional()
  @IsInt()
  @Min(0)
  ageTo?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(32)
  foreignAcceptanceCode?: string | null

  @IsOptional()
  billingRate?: number | string | null

  @IsOptional()
  unitPaymentPrice?: number | string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfInterviews?: number | null

  @IsString()
  @MaxLength(32)
  commercialFlowCode!: string

  @IsOptional()
  @IsString()
  @MaxLength(128)
  station?: string | null

  @IsDateString()
  beginDate!: string

  @IsOptional()
  @IsDateString()
  endDate?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(128)
  representativeSalesName?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(36)
  customerId?: string | null

  @IsOptional()
  @IsString()
  remarks?: string | null
}

import { IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'

export class UpdateCustomerDto {
  @IsString()
  @MaxLength(256)
  companyName!: string

  @IsOptional()
  @IsString()
  @MaxLength(256)
  companyNameKana?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(128)
  representativeName?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(256)
  address?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(256)
  buildingName?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(24)
  phoneNumber?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(24)
  faxNumber?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(14)
  invoiceNo?: string | null

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(512)
  siteUrl?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(32)
  proposalCategoryCode?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(32)
  importanceCode?: string | null

  @IsOptional()
  @IsDateString()
  scheduledContractStartDate?: string | null

  @IsOptional()
  @IsDateString()
  contractConclusionDate?: string | null

  @IsOptional()
  @IsDateString()
  scheduledContractEndDate?: string | null

  @IsOptional()
  @IsDateString()
  contractEndDate?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(128)
  primarySales?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(128)
  secondarySales?: string | null

  @IsOptional()
  @IsString()
  remarks?: string | null
}

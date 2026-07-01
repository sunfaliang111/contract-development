import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  contentType!: string

  @IsString()
  @IsNotEmpty()
  contentBase64!: string
}

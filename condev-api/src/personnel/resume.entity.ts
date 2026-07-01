import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 't_resumes' })
export class Resume {
  @PrimaryColumn({ length: 36 })
  id!: string

  @Column({ name: 'engineer_id', length: 36 })
  engineerId!: string

  @Column({ length: 255 })
  title!: string

  @Column({ type: 'int', default: 1 })
  version!: number

  @Column({ type: 'text', nullable: true })
  summary!: string | null

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true })
  fileUrl!: string | null

  @Column({ name: 'file_name', type: 'varchar', length: 255, nullable: true })
  fileName!: string | null

  @Column({ name: 'content_type', type: 'varchar', length: 120, nullable: true })
  contentType!: string | null

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize!: string | null

  @Column({ name: 'storage_path', type: 'varchar', length: 500, nullable: true })
  storagePath!: string | null

  @Column({ name: 'is_current', type: 'tinyint', default: 1 })
  isCurrent!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt!: Date | null
}

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { PersonnelJobCategory } from './personnel-job-category.entity'

@Entity('m_personnel')
export class Personnel {
  @PrimaryColumn({ name: 'personnel_id', length: 36 })
  id!: string

  @Column({ name: 'personnel_name', length: 256 })
  personnelName!: string

  @Column({ name: 'personnel_name_kana', type: 'varchar', length: 256, nullable: true })
  personnelNameKana!: string | null

  @Column({ name: 'personnel_name_display', type: 'varchar', length: 256, nullable: true })
  personnelNameDisplay!: string | null

  @Column({ name: 'contract_type_code', length: 32 })
  contractTypeCode!: string

  @Column({ type: 'varchar', length: 256, nullable: true })
  affiliation!: string | null

  @Column({ type: 'text' })
  skills!: string

  @Column({ name: 'birth_date', type: 'date' })
  birthDate!: string

  @Column({ name: 'sex_code', length: 32 })
  sexCode!: string

  @Column({ name: 'nationality_code', length: 32, default: 'JAPANESE' })
  nationalityCode!: string

  @Column({ type: 'decimal', precision: 12, scale: 0 })
  price!: string

  @Column({ type: 'varchar', length: 128, nullable: true })
  station!: string | null

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: string | null

  @Column({ name: 'representative_sales_name', type: 'varchar', length: 128, nullable: true })
  representativeSalesName!: string | null

  @Column({ name: 'availability_code', length: 32, default: 'AVAILABLE' })
  availabilityCode!: string

  @Column({ name: 'project_id', type: 'varchar', length: 36, nullable: true })
  projectId!: string | null

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt!: Date

  @Column({ name: 'registered_by', length: 128 })
  registeredBy!: string

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'updated_by', length: 128 })
  updatedBy!: string

  @OneToMany(() => PersonnelJobCategory, (jobCategory) => jobCategory.personnel, {
    cascade: true
  })
  jobCategories!: PersonnelJobCategory[]
}

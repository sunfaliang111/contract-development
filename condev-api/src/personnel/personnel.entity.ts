import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { PersonnelJobCategory } from './personnel-job-category.entity'

@Entity('m_engineers')
export class Personnel {
  @PrimaryColumn({ name: 'engineer_id', length: 36 })
  id!: string

  @Column({ name: 'name', length: 100 })
  personnelName!: string

  @Column({ name: 'name_kana', type: 'varchar', length: 100, nullable: true })
  personnelNameKana!: string | null

  @Column({ name: 'personnel_name_display', type: 'varchar', length: 256, nullable: true })
  personnelNameDisplay!: string | null

  @Column({ name: 'engineer_type', length: 32 })
  contractTypeCode!: string

  @Column({ name: 'partner_customer_id', type: 'varchar', length: 36, nullable: true })
  partnerCustomerId!: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null

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

  @Column({ name: 'nearest_station', type: 'varchar', length: 100, nullable: true })
  station!: string | null

  @Column({ name: 'available_from', type: 'date', nullable: true })
  startDate!: string | null

  @Column({ name: 'representative_sales_name', type: 'varchar', length: 128, nullable: true })
  representativeSalesName!: string | null

  @Column({ name: 'current_status', length: 32, default: 'waiting' })
  availabilityCode!: string

  @Column({ name: 'project_id', type: 'varchar', length: 36, nullable: true })
  projectId!: string | null

  @Column({ name: 'notes', type: 'text', nullable: true })
  remarks!: string | null

  @CreateDateColumn({ name: 'created_at' })
  registeredAt!: Date

  @Column({ name: 'created_by', type: 'varchar', length: 128, nullable: true })
  registeredBy!: string

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'updated_by', type: 'varchar', length: 128, nullable: true })
  updatedBy!: string

  @OneToMany(() => PersonnelJobCategory, (jobCategory) => jobCategory.personnel, {
    cascade: true
  })
  jobCategories!: PersonnelJobCategory[]
}

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { ProjectJobCategory } from './project-job-category.entity'

@Entity('m_projects')
export class Project {
  @PrimaryColumn({ name: 'project_id', length: 36 })
  id!: string

  @Column({ name: 'project_name', length: 256 })
  projectName!: string

  @Column({ name: 'project_overview', type: 'text' })
  projectOverview!: string

  @Column({ name: 'project_detail', type: 'text', nullable: true })
  projectDetail!: string | null

  @Column({ type: 'text', nullable: true })
  skills!: string | null

  @Column({ name: 'age_from', type: 'int', nullable: true })
  ageFrom!: number | null

  @Column({ name: 'age_to', type: 'int', nullable: true })
  ageTo!: number | null

  @Column({ name: 'foreign_acceptance_code', length: 32, default: 'ACCEPTABLE' })
  foreignAcceptanceCode!: string

  @Column({ name: 'billing_rate', type: 'decimal', precision: 12, scale: 0, nullable: true })
  billingRate!: string | null

  @Column({ name: 'unit_payment_price', type: 'decimal', precision: 12, scale: 0, nullable: true })
  unitPaymentPrice!: string | null

  @Column({ name: 'number_of_interviews', type: 'int', nullable: true, default: 1 })
  numberOfInterviews!: number | null

  @Column({ name: 'commercial_flow_code', length: 32 })
  commercialFlowCode!: string

  @Column({ type: 'varchar', length: 128, nullable: true })
  station!: string | null

  @Column({ name: 'begin_date', type: 'date' })
  beginDate!: string

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null

  @Column({ name: 'representative_sales_name', type: 'varchar', length: 128, nullable: true })
  representativeSalesName!: string | null

  @Column({ name: 'customer_id', type: 'varchar', length: 36, nullable: true })
  customerId!: string | null

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

  @OneToMany(() => ProjectJobCategory, (jobCategory) => jobCategory.project, {
    cascade: true
  })
  jobCategories!: ProjectJobCategory[]
}

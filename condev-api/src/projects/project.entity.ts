import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { ProjectJobCategory } from './project-job-category.entity'

@Entity('t_projects')
export class Project {
  @PrimaryColumn({ name: 'project_id', length: 36 })
  id!: string

  @Column({ name: 'title', length: 255 })
  projectName!: string

  @Column({ name: 'description', type: 'text', nullable: true })
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

  @Column({ name: 'required_role', type: 'varchar', length: 100, nullable: true })
  requiredRole!: string | null

  @Column({ name: 'required_headcount', type: 'int', default: 1 })
  requiredHeadcount!: number

  @Column({ name: 'commercial_flow_code', length: 32 })
  commercialFlowCode!: string

  @Column({ type: 'varchar', length: 128, nullable: true })
  station!: string | null

  @Column({ name: 'start_date', type: 'date', nullable: true })
  beginDate!: string

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null

  @Column({ name: 'contract_type', type: 'varchar', length: 32, nullable: true })
  contractType!: string | null

  @Column({ name: 'payment_site', type: 'varchar', length: 50, nullable: true })
  paymentSite!: string | null

  @Column({ length: 32, default: 'open' })
  status!: string

  @Column({ type: 'varchar', length: 32, nullable: true })
  priority!: string | null

  @Column({ name: 'representative_sales_name', type: 'varchar', length: 128, nullable: true })
  representativeSalesName!: string | null

  @Column({ name: 'customer_id', type: 'varchar', length: 36, nullable: true })
  customerId!: string | null

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

  @OneToMany(() => ProjectJobCategory, (jobCategory) => jobCategory.project, {
    cascade: true
  })
  jobCategories!: ProjectJobCategory[]
}

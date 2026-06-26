import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('m_customers')
export class Customer {
  @PrimaryColumn({ length: 36 })
  id!: string

  @Column({ name: 'company_name', length: 160 })
  companyName!: string

  @Column({ name: 'company_name_kana', type: 'varchar', length: 256, nullable: true })
  companyNameKana!: string | null

  @Column({ name: 'representative_name', type: 'varchar', length: 128, nullable: true })
  representativeName!: string | null

  @Column({ name: 'postal_code', type: 'varchar', length: 10, nullable: true })
  postalCode!: string | null

  @Column({ type: 'varchar', length: 256, nullable: true })
  address!: string | null

  @Column({ name: 'building_name', type: 'varchar', length: 256, nullable: true })
  buildingName!: string | null

  @Column({ name: 'phone_number', type: 'varchar', length: 24, nullable: true })
  phoneNumber!: string | null

  @Column({ name: 'fax_number', type: 'varchar', length: 24, nullable: true })
  faxNumber!: string | null

  @Column({ name: 'invoice_no', type: 'varchar', length: 14, nullable: true })
  invoiceNo!: string | null

  @Column({ name: 'site_url', type: 'varchar', length: 512, nullable: true })
  siteUrl!: string | null

  @Column({ name: 'proposal_category_code', type: 'varchar', length: 32, nullable: true })
  proposalCategoryCode!: string | null

  @Column({ name: 'importance_code', type: 'varchar', length: 32, nullable: true })
  importanceCode!: string | null

  @Column({ name: 'scheduled_contract_start_date', type: 'date', nullable: true })
  scheduledContractStartDate!: string | null

  @Column({ name: 'contract_conclusion_date', type: 'date', nullable: true })
  contractConclusionDate!: string | null

  @Column({ name: 'scheduled_contract_end_date', type: 'date', nullable: true })
  scheduledContractEndDate!: string | null

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate!: string | null

  @Column({ name: 'primary_sales', type: 'varchar', length: 128, nullable: true })
  primarySales!: string | null

  @Column({ name: 'secondary_sales', type: 'varchar', length: 128, nullable: true })
  secondarySales!: string | null

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'registered_by', length: 128 })
  registeredBy!: string

  @Column({ name: 'updated_by', length: 128 })
  updatedBy!: string
}

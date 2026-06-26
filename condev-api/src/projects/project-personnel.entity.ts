import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('t_project_personnel')
export class ProjectPersonnel {
  @PrimaryColumn({ name: 'project_personnel_id', length: 36 })
  id!: string

  @Column({ name: 'project_id', length: 36 })
  projectId!: string

  @Column({ name: 'personnel_id', length: 36 })
  personnelId!: string

  @Column({ name: 'assignment_status_code', length: 32, default: 'PROPOSED' })
  assignmentStatusCode!: string

  @Column({ name: 'assigned_from', type: 'date', nullable: true })
  assignedFrom!: string | null

  @Column({ name: 'assigned_to', type: 'date', nullable: true })
  assignedTo!: string | null

  @Column({ name: 'billing_rate', type: 'decimal', precision: 12, scale: 0, nullable: true })
  billingRate!: string | null

  @Column({ name: 'payment_price', type: 'decimal', precision: 12, scale: 0, nullable: true })
  paymentPrice!: string | null

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @CreateDateColumn({ name: 'created_at' })
  registeredAt!: Date

  @Column({ name: 'created_by', type: 'varchar', length: 128, nullable: true })
  registeredBy!: string

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'updated_by', type: 'varchar', length: 128, nullable: true })
  updatedBy!: string
}

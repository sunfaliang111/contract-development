import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Personnel } from './personnel.entity'

@Entity('t_engineer_job_categories')
export class PersonnelJobCategory {
  @PrimaryColumn({ name: 'engineer_id', length: 36 })
  personnelId!: string

  @PrimaryColumn({ name: 'job_category_code', length: 64 })
  jobCategoryCode!: string

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @ManyToOne(() => Personnel, (personnel) => personnel.jobCategories, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'engineer_id' })
  personnel!: Personnel
}

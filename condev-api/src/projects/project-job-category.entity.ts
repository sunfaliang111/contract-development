import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Project } from './project.entity'

@Entity('t_project_job_categories')
export class ProjectJobCategory {
  @PrimaryColumn({ name: 'project_id', length: 36 })
  projectId!: string

  @PrimaryColumn({ name: 'job_category_code', length: 64 })
  jobCategoryCode!: string

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @ManyToOne(() => Project, (project) => project.jobCategories, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'project_id' })
  project!: Project
}

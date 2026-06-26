import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm'

@Entity('m_codes')
export class Code {
  @PrimaryColumn({ name: 'code_type', length: 64 })
  codeType!: string

  @PrimaryColumn({ length: 64 })
  code!: string

  @Column({ name: 'code_value', length: 256 })
  codeValue!: string

  @Column({ name: 'code_value_kana', type: 'varchar', length: 256, nullable: true })
  codeValueKana!: string | null

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @Column({ type: 'text', nullable: true })
  remarks!: string | null

  @CreateDateColumn({ name: 'created_at' })
  registeredAt!: Date

  @Column({ name: 'created_by', length: 128, default: 'system' })
  registeredBy!: string

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ name: 'updated_by', length: 128, default: 'system' })
  updatedBy!: string
}

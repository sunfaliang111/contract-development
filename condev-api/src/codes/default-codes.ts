export type DefaultCode = {
  codeType: string
  code: string
  codeValue: string
  displayOrder: number
}

export const defaultCodes: DefaultCode[] = [
  { codeType: 'COMMERCIAL_FLOW', code: 'END_DIRECT', codeValue: 'エンド直', displayOrder: 10 },
  { codeType: 'COMMERCIAL_FLOW', code: 'PRIME', codeValue: '元請け', displayOrder: 20 },
  { codeType: 'COMMERCIAL_FLOW', code: 'FIRST_SUB', codeValue: '一次請け', displayOrder: 30 },
  { codeType: 'COMMERCIAL_FLOW', code: 'SECOND_OR_MORE', codeValue: '二次請け以下', displayOrder: 40 },
  { codeType: 'CONTRACT_TYPE', code: 'EMPLOYEE', codeValue: '正社員', displayOrder: 10 },
  { codeType: 'CONTRACT_TYPE', code: 'CONTRACT_EMPLOYEE', codeValue: '契約社員', displayOrder: 20 },
  { codeType: 'CONTRACT_TYPE', code: 'BP', codeValue: 'BP', displayOrder: 30 },
  { codeType: 'JOB_CATEGORY', code: 'CONSULTANT', codeValue: 'コンサルタント', displayOrder: 10 },
  { codeType: 'JOB_CATEGORY', code: 'PM', codeValue: 'PM', displayOrder: 20 },
  { codeType: 'JOB_CATEGORY', code: 'PL', codeValue: 'PL', displayOrder: 30 },
  { codeType: 'JOB_CATEGORY', code: 'PMO', codeValue: 'PMO', displayOrder: 40 },
  { codeType: 'JOB_CATEGORY', code: 'SE', codeValue: 'SE', displayOrder: 50 },
  { codeType: 'JOB_CATEGORY', code: 'PG', codeValue: 'PG', displayOrder: 60 },
  { codeType: 'JOB_CATEGORY', code: 'TESTER', codeValue: 'テスター', displayOrder: 70 },
  { codeType: 'JOB_CATEGORY', code: 'SERVER_ENGINEER', codeValue: 'サーバエンジニア', displayOrder: 80 },
  { codeType: 'JOB_CATEGORY', code: 'NETWORK_ENGINEER', codeValue: 'ネットワークエンジニア', displayOrder: 90 },
  { codeType: 'JOB_CATEGORY', code: 'WEB_DESIGNER', codeValue: 'WEBデザイナー', displayOrder: 100 },
  { codeType: 'JOB_CATEGORY', code: 'WEB_DIRECTOR', codeValue: 'WEBディレクター', displayOrder: 110 },
  { codeType: 'JOB_CATEGORY', code: 'HELPDESK_KITTING', codeValue: 'ヘルプデスク・キッティング', displayOrder: 120 },
  { codeType: 'JOB_CATEGORY', code: 'OTHER', codeValue: 'その他', displayOrder: 999 },
  { codeType: 'PROPOSAL_CATEGORY', code: 'PROJECT', codeValue: '案件', displayOrder: 10 },
  { codeType: 'PROPOSAL_CATEGORY', code: 'PERSONNEL', codeValue: '人材', displayOrder: 20 },
  { codeType: 'IMPORTANCE', code: 'HIGH', codeValue: '高', displayOrder: 10 },
  { codeType: 'IMPORTANCE', code: 'MIDDLE', codeValue: '中', displayOrder: 20 },
  { codeType: 'IMPORTANCE', code: 'LOW', codeValue: '低', displayOrder: 30 },
  { codeType: 'SEX', code: 'MALE', codeValue: '男性', displayOrder: 10 },
  { codeType: 'SEX', code: 'FEMALE', codeValue: '女性', displayOrder: 20 },
  { codeType: 'NATIONALITY_TYPE', code: 'JAPANESE', codeValue: '日本人', displayOrder: 10 },
  { codeType: 'NATIONALITY_TYPE', code: 'FOREIGN', codeValue: '外国籍', displayOrder: 20 },
  { codeType: 'FOREIGN_ACCEPTANCE', code: 'ACCEPTABLE', codeValue: '外国籍可', displayOrder: 10 },
  { codeType: 'FOREIGN_ACCEPTANCE', code: 'NOT_ACCEPTABLE', codeValue: '外国籍不可', displayOrder: 20 },
  { codeType: 'ASSIGNMENT_AVAILABILITY', code: 'AVAILABLE', codeValue: '可', displayOrder: 10 },
  { codeType: 'ASSIGNMENT_AVAILABILITY', code: 'UNAVAILABLE', codeValue: '不可', displayOrder: 20 },
  { codeType: 'ASSIGNMENT_STATUS', code: 'PROPOSED', codeValue: '提案中', displayOrder: 10 },
  { codeType: 'ASSIGNMENT_STATUS', code: 'ASSIGNED', codeValue: 'アサイン済', displayOrder: 20 },
  { codeType: 'ASSIGNMENT_STATUS', code: 'ENDED', codeValue: '終了', displayOrder: 30 }
]

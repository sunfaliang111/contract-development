<script setup lang="ts">
import * as yup from 'yup'
import type { FieldErrors } from '~/composables/useYupValidation'

type CodeItem = { code: string; codeValue: string }
type CodesResponse = Record<string, CodeItem[]>
type Project = { id: string; projectName: string }
type ProjectListResponse = { items: Project[] }
type Detail = {
  id: string
  personnelName: string
  personnelNameKana: string | null
  personnelNameDisplay: string | null
  contractTypeCode: string
  affiliation: string | null
  skills: string
  jobCategoryCodes: string[]
  birthDate: string
  sexCode: string
  nationalityCode: string
  price: string
  station: string | null
  startDate: string | null
  representativeSalesName: string | null
  availabilityCode: string
  projectId: string | null
  remarks: string | null
  registeredBy: string
  registeredAt: string
  updatedBy: string
  updatedAt: string
}

const { $api } = useNuxtApp()
const route = useRoute()

definePageMeta({ layout: 'authenticated' })

const detail = ref<Detail | null>(null)
const codes = ref<CodesResponse>({})
const projects = ref<Project[]>([])
const form = reactive({
  personnelName: '',
  personnelNameKana: '',
  personnelNameDisplay: '',
  contractTypeCode: '',
  affiliation: '',
  skills: '',
  jobCategoryCodes: [] as string[],
  birthDate: '',
  sexCode: '',
  nationalityCode: 'JAPANESE',
  price: null as number | null,
  station: '',
  startDate: '',
  representativeSalesName: '',
  availabilityCode: 'AVAILABLE',
  projectId: '',
  remarks: ''
})
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fieldErrors = ref<FieldErrors>({})

const schema = yup.object({
  personnelName: yup.string().trim().required('要員名を入力してください。'),
  contractTypeCode: yup.string().required('契約形態を選択してください。'),
  skills: yup.string().trim().required('スキルを入力してください。'),
  jobCategoryCodes: yup.array().of(yup.string().required()).min(1, '職種を1つ以上選択してください。'),
  birthDate: yup.string().required('誕生日を入力してください。'),
  sexCode: yup.string().required('性別を選択してください。'),
  price: yup.number().typeError('単価を入力してください。').required('単価を入力してください。').min(0, '単価は0以上で入力してください。')
})

const codeOptions = (type: string) => (codes.value[type] || []).map((item) => ({ title: item.codeValue, value: item.code }))
const codeValue = (type: string, code: string | null | undefined) => codes.value[type]?.find((item) => item.code === code)?.codeValue || code || '-'
const formatDate = (value: string | null | undefined) => value ? new Intl.DateTimeFormat('ja-JP').format(new Date(value)) : '-'
const formatDateTime = (value: string) => new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(value))
const assignedProject = computed(() => projects.value.find((project) => project.id === detail.value?.projectId) || null)
const assignedProjectName = computed(() => assignedProject.value?.projectName || detail.value?.projectId || '未アサイン')

const syncForm = (item: Detail) => {
  form.personnelName = item.personnelName
  form.personnelNameKana = item.personnelNameKana || ''
  form.personnelNameDisplay = item.personnelNameDisplay || ''
  form.contractTypeCode = item.contractTypeCode
  form.affiliation = item.affiliation || ''
  form.skills = item.skills
  form.jobCategoryCodes = [...(item.jobCategoryCodes || [])]
  form.birthDate = item.birthDate
  form.sexCode = item.sexCode
  form.nationalityCode = item.nationalityCode
  form.price = item.price ? Number(item.price) : null
  form.station = item.station || ''
  form.startDate = item.startDate || ''
  form.representativeSalesName = item.representativeSalesName || ''
  form.availabilityCode = item.availabilityCode
  form.projectId = item.projectId || ''
  form.remarks = item.remarks || ''
}

const fetchCodes = async () => {
  const { data } = await $api.get<CodesResponse>('/codes', {
    params: { types: 'JOB_CATEGORY,CONTRACT_TYPE,SEX,NATIONALITY_TYPE,ASSIGNMENT_AVAILABILITY' }
  })
  codes.value = data
}

const fetchProjects = async () => {
  const { data } = await $api.get<ProjectListResponse>('/projects', {
    params: { page: 1, limit: 100 }
  })
  projects.value = data.items
}

const fetchDetail = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.get<Detail>(`/personnel/${route.params.id}`)
    detail.value = data
    syncForm(data)
  } catch {
    errorMessage.value = '要員情報の取得に失敗しました。'
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  if (!detail.value) return
  syncForm(detail.value)
  editing.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

const cancelEdit = () => {
  if (detail.value) syncForm(detail.value)
  editing.value = false
  errorMessage.value = ''
  fieldErrors.value = {}
}

const save = async () => {
  fieldErrors.value = await validateYupForm(schema, form)
  if (Object.keys(fieldErrors.value).length > 0) return

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await $api.patch<Detail>(`/personnel/${route.params.id}`, {
      ...form,
      personnelNameKana: form.personnelNameKana || null,
      personnelNameDisplay: form.personnelNameDisplay || null,
      affiliation: form.affiliation || null,
      startDate: form.startDate || null,
      station: form.station || null,
      representativeSalesName: form.representativeSalesName || null,
      projectId: form.projectId || null,
      remarks: form.remarks || null
    })
    detail.value = data
    syncForm(data)
    editing.value = false
    successMessage.value = '要員情報を更新しました。'
  } catch {
    errorMessage.value = '要員情報の更新に失敗しました。入力内容を確認してください。'
  } finally {
    saving.value = false
  }
}

const deletePersonnel = async () => {
  if (!detail.value || !window.confirm(`要員「${detail.value.personnelName}」を削除します。よろしいですか？`)) {
    return
  }

  try {
    const projectId = detail.value.projectId
    await $api.delete(`/personnel/${detail.value.id}`)
    await navigateTo(projectId ? `/projects/${projectId}` : '/engineers')
  } catch {
    errorMessage.value = '要員の削除に失敗しました。'
  }
}

onMounted(async () => {
  await Promise.all([fetchCodes(), fetchProjects()])
  await fetchDetail()
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">{{ editing ? '要員編集' : '要員参照' }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ editing ? '要員の詳細情報を編集できます。' : '要員の詳細情報を確認できます。' }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" to="/engineers">一覧へ戻る</v-btn>
        <v-btn v-if="!editing" color="primary" prepend-icon="mdi-pencil" :disabled="!detail" :to="`/engineers/${route.params.id}/edit`">編集</v-btn>
        <v-btn v-if="!editing" color="error" prepend-icon="mdi-delete-outline" variant="outlined" :disabled="!detail" @click="deletePersonnel">削除</v-btn>
        <template v-else>
          <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" @click="cancelEdit">キャンセル</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="save">保存</v-btn>
        </template>
      </div>
    </div>
    <v-alert v-if="successMessage" class="mb-5" density="comfortable" type="success" variant="tonal">{{ successMessage }}</v-alert>
    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>
    <v-card class="management-detail-card pa-5 pa-md-6">
      <v-progress-linear v-if="loading" class="mb-5" color="primary" indeterminate />
      <template v-if="detail">
        <div class="relationship-summary mb-5">
          <div class="relationship-metric" :class="detail.projectId ? 'relationship-metric--success' : 'relationship-metric--warning'">
            <div class="relationship-metric__label">アサイン状況</div>
            <div class="relationship-metric__value relationship-metric__value--text">{{ detail.projectId ? 'アサイン済' : '未アサイン' }}</div>
          </div>
          <div class="relationship-metric">
            <div class="relationship-metric__label">担当案件</div>
            <div class="relationship-metric__value relationship-metric__value--text">{{ assignedProjectName }}</div>
          </div>
        </div>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.personnelName" class="management-detail-field" :error-messages="fieldErrors.personnelName" :readonly="!editing">
              <template #label><RequiredLabel>要員名</RequiredLabel></template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.personnelNameKana" class="management-detail-field" label="要員名かな" :readonly="!editing" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.personnelNameDisplay" class="management-detail-field" label="要員表示名" :readonly="!editing" /></v-col>
          <v-col cols="12" md="6">
            <v-select v-if="editing" v-model="form.contractTypeCode" class="management-detail-field" :error-messages="fieldErrors.contractTypeCode" :items="codeOptions('CONTRACT_TYPE')">
              <template #label><RequiredLabel>契約形態</RequiredLabel></template>
            </v-select>
            <v-text-field v-else class="management-detail-field" label="契約形態" :model-value="codeValue('CONTRACT_TYPE', detail.contractTypeCode)" readonly />
          </v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.affiliation" class="management-detail-field" label="所属先" :readonly="!editing" /></v-col>
          <v-col cols="12" md="6">
            <v-select v-if="editing" v-model="form.jobCategoryCodes" chips class="management-detail-field" closable-chips :error-messages="fieldErrors.jobCategoryCodes" :items="codeOptions('JOB_CATEGORY')" multiple>
              <template #label><RequiredLabel>職種</RequiredLabel></template>
            </v-select>
            <v-text-field v-else class="management-detail-field" label="職種" :model-value="form.jobCategoryCodes.map((code) => codeValue('JOB_CATEGORY', code)).join('、') || '-'" readonly />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.skills" auto-grow class="management-detail-field" :error-messages="fieldErrors.skills" :readonly="!editing" rows="3">
              <template #label><RequiredLabel>スキル</RequiredLabel></template>
            </v-textarea>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-if="editing" v-model="form.birthDate" class="management-detail-field" :error-messages="fieldErrors.birthDate" type="date">
              <template #label><RequiredLabel>誕生日</RequiredLabel></template>
            </v-text-field>
            <v-text-field v-else class="management-detail-field" label="誕生日" :model-value="formatDate(detail.birthDate)" readonly />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-if="editing" v-model="form.sexCode" class="management-detail-field" :error-messages="fieldErrors.sexCode" :items="codeOptions('SEX')">
              <template #label><RequiredLabel>性別</RequiredLabel></template>
            </v-select>
            <v-text-field v-else class="management-detail-field" label="性別" :model-value="codeValue('SEX', detail.sexCode)" readonly />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-if="editing" v-model="form.nationalityCode" class="management-detail-field" :items="codeOptions('NATIONALITY_TYPE')" label="国籍区分" />
            <v-text-field v-else class="management-detail-field" label="国籍区分" :model-value="codeValue('NATIONALITY_TYPE', detail.nationalityCode)" readonly />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model.number="form.price" class="management-detail-field" :error-messages="fieldErrors.price" :readonly="!editing" type="number">
              <template #label><RequiredLabel>単価</RequiredLabel></template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.station" class="management-detail-field" label="最寄駅" :readonly="!editing" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-if="editing" v-model="form.startDate" class="management-detail-field" label="稼働開始日" type="date" /><v-text-field v-else class="management-detail-field" label="稼働開始日" :model-value="formatDate(detail.startDate)" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.representativeSalesName" class="management-detail-field" label="担当営業" :readonly="!editing" /></v-col>
          <v-col cols="12" md="6">
            <v-select v-if="editing" v-model="form.availabilityCode" class="management-detail-field" :items="codeOptions('ASSIGNMENT_AVAILABILITY')" label="アサイン可否" />
            <v-text-field v-else class="management-detail-field" label="アサイン可否" :model-value="codeValue('ASSIGNMENT_AVAILABILITY', detail.availabilityCode)" readonly />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-if="editing" v-model="form.projectId" class="management-detail-field" clearable item-title="projectName" item-value="id" :items="projects" label="担当案件" />
            <v-text-field v-else class="management-detail-field" label="担当案件" :model-value="projects.find((project) => project.id === detail?.projectId)?.projectName || '-'" readonly />
          </v-col>
          <v-col cols="12"><v-textarea v-model="form.remarks" auto-grow class="management-detail-field" label="備考" :readonly="!editing" rows="3" /></v-col>
          <v-col cols="12" md="6"><v-text-field class="management-detail-field management-detail-field--readonly" label="登録者" :model-value="detail.registeredBy" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field class="management-detail-field management-detail-field--readonly" label="登録日時" :model-value="formatDateTime(detail.registeredAt)" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field class="management-detail-field management-detail-field--readonly" label="更新者" :model-value="detail.updatedBy" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field class="management-detail-field management-detail-field--readonly" label="更新日時" :model-value="formatDateTime(detail.updatedAt)" readonly /></v-col>
        </v-row>
        <div v-if="editing" class="management-detail-actions mt-4">
          <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" @click="cancelEdit">キャンセル</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="save">保存</v-btn>
        </div>
        <v-divider class="my-6" />
        <ResumeManager :personnel-id="detail.id" />
      </template>
    </v-card>
  </div>
</template>

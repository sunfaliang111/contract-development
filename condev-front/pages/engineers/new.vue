<script setup lang="ts">
import * as yup from 'yup'
import type { FieldErrors } from '~/composables/useYupValidation'

type CodeItem = { code: string; codeValue: string }
type CodesResponse = Record<string, CodeItem[]>
type Detail = { id: string }
type Project = { id: string; projectName: string }
type ProjectListResponse = { items: Project[] }

const { $api } = useNuxtApp()
const route = useRoute()

definePageMeta({ layout: 'authenticated' })

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

const codes = ref<CodesResponse>({})
const projects = ref<Project[]>([])
const saving = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<FieldErrors>({})
const resumeFilePicker = ref<HTMLInputElement | null>(null)
const resumeFile = ref<File | null>(null)
const resumeTitle = ref('')

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
const returnTo = computed(() => typeof route.query.returnTo === 'string' ? route.query.returnTo : '')
const cancelTo = computed(() => returnTo.value || '/engineers')
const selectedResumeFileName = computed(() => resumeFile.value?.name || '')

const handleResumeFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.item(0) || null
  resumeFile.value = file
  if (file && !resumeTitle.value) {
    resumeTitle.value = file.name
  }
}

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result || '')
    resolve(result.includes(',') ? result.split(',')[1] : result)
  }
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

const uploadResume = async (personnelId: string) => {
  if (!resumeFile.value) return

  await $api.post(`/personnel/${personnelId}/resumes`, {
    title: resumeTitle.value || resumeFile.value.name,
    fileName: resumeFile.value.name,
    contentType: resumeFile.value.type || 'application/octet-stream',
    contentBase64: await toBase64(resumeFile.value)
  })
}

const fetchCodes = async () => {
  const { data } = await $api.get<CodesResponse>('/codes', {
    params: { types: 'JOB_CATEGORY,CONTRACT_TYPE,SEX,NATIONALITY_TYPE,ASSIGNMENT_AVAILABILITY' }
  })
  codes.value = data
  form.contractTypeCode ||= data.CONTRACT_TYPE?.[0]?.code || ''
  form.sexCode ||= data.SEX?.[0]?.code || ''
}

const fetchProjects = async () => {
  const { data } = await $api.get<ProjectListResponse>('/projects', {
    params: { page: 1, limit: 100 }
  })
  projects.value = data.items
  if (typeof route.query.projectId === 'string') {
    form.projectId = route.query.projectId
  }
}

const createPersonnel = async () => {
  fieldErrors.value = await validateYupForm(schema, form)
  if (Object.keys(fieldErrors.value).length > 0) return

  saving.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.post<Detail>('/personnel', {
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
    if (resumeFile.value) {
      try {
        await uploadResume(data.id)
      } catch {
        await navigateTo(`/engineers/${data.id}/edit?resumeUploadFailed=1`)
        return
      }
    }
    await navigateTo(returnTo.value || `/engineers/${data.id}`)
  } catch {
    errorMessage.value = '要員情報の登録に失敗しました。入力内容を確認してください。'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchCodes(), fetchProjects()])
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">要員新規</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">新しい要員情報を登録できます。</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" :to="cancelTo">一覧へ戻る</v-btn>
        <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" :to="cancelTo">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="createPersonnel">保存</v-btn>
      </div>
    </div>
    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>
    <v-card class="management-detail-card pa-5 pa-md-6">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.personnelName" class="management-detail-field" :error-messages="fieldErrors.personnelName">
            <template #label><RequiredLabel>要員名</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.personnelNameKana" class="management-detail-field" label="要員名かな" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.personnelNameDisplay" class="management-detail-field" label="要員表示名" /></v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.contractTypeCode" class="management-detail-field" :error-messages="fieldErrors.contractTypeCode" :items="codeOptions('CONTRACT_TYPE')">
            <template #label><RequiredLabel>契約形態</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.affiliation" class="management-detail-field" label="所属先" /></v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.jobCategoryCodes" chips class="management-detail-field" closable-chips :error-messages="fieldErrors.jobCategoryCodes" :items="codeOptions('JOB_CATEGORY')" multiple>
            <template #label><RequiredLabel>職種</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.skills" auto-grow class="management-detail-field" :error-messages="fieldErrors.skills" rows="3">
            <template #label><RequiredLabel>スキル</RequiredLabel></template>
          </v-textarea>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.birthDate" class="management-detail-field" :error-messages="fieldErrors.birthDate" type="date">
            <template #label><RequiredLabel>誕生日</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="form.sexCode" class="management-detail-field" :error-messages="fieldErrors.sexCode" :items="codeOptions('SEX')">
            <template #label><RequiredLabel>性別</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12" md="4"><v-select v-model="form.nationalityCode" class="management-detail-field" :items="codeOptions('NATIONALITY_TYPE')" label="国籍区分" /></v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model.number="form.price" class="management-detail-field" :error-messages="fieldErrors.price" type="number">
            <template #label><RequiredLabel>単価</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.station" class="management-detail-field" label="最寄駅" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.startDate" class="management-detail-field" label="稼働開始日" type="date" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.representativeSalesName" class="management-detail-field" label="担当営業" /></v-col>
        <v-col cols="12" md="6"><v-select v-model="form.availabilityCode" class="management-detail-field" :items="codeOptions('ASSIGNMENT_AVAILABILITY')" label="アサイン可否" /></v-col>
        <v-col cols="12" md="6"><v-select v-model="form.projectId" class="management-detail-field" clearable item-title="projectName" item-value="id" :items="projects" label="担当案件" /></v-col>
        <v-col cols="12"><v-textarea v-model="form.remarks" auto-grow class="management-detail-field" label="備考" rows="3" /></v-col>
      </v-row>
      <v-divider class="my-6" />
      <div class="mb-4">
        <h2 class="text-subtitle-1 font-weight-bold mb-1">経歴書</h2>
        <p class="text-caption text-medium-emphasis mb-0">要員保存後、選択したPDF、Word、Excel形式の経歴書を自動登録します。</p>
      </div>
      <v-row align="center" dense>
        <v-col cols="12" md="4">
          <v-text-field v-model="resumeTitle" class="management-detail-field" density="compact" hide-details label="タイトル" />
        </v-col>
        <v-col cols="12" md="5">
          <label class="resume-file-field">
            <span class="resume-file-field__label">経歴書ファイル</span>
            <span class="resume-file-field__body">
              <v-icon icon="mdi-paperclip" size="18" />
              <span class="resume-file-field__name">{{ selectedResumeFileName || 'ファイルを選択' }}</span>
              <v-icon icon="mdi-folder-open-outline" size="20" />
            </span>
            <input
              ref="resumeFilePicker"
              accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              class="resume-file-field__input"
              type="file"
              @change="handleResumeFileChange"
            />
          </label>
        </v-col>
        <v-col cols="12" md="3">
          <div class="text-caption text-medium-emphasis">任意登録</div>
        </v-col>
      </v-row>
      <div class="management-detail-actions mt-4">
        <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" :to="cancelTo">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="createPersonnel">保存</v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.resume-file-field {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.38);
  border-radius: 4px;
  cursor: pointer;
  display: block;
  min-height: 40px;
  padding: 6px 12px;
  position: relative;
}

.resume-file-field:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.86);
}

.resume-file-field__label {
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 12px;
  left: 10px;
  line-height: 1;
  padding: 0 4px;
  position: absolute;
  top: -7px;
}

.resume-file-field__body {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.resume-file-field__name {
  flex: 1;
  font-size: 14px;
  line-height: 26px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-file-field__input {
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
}
</style>

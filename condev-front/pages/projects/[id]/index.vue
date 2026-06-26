<script setup lang="ts">
import * as yup from 'yup'
import type { FieldErrors } from '~/composables/useYupValidation'

type CodeItem = { code: string; codeValue: string }
type CodesResponse = Record<string, CodeItem[]>
type Customer = { id: string; companyName: string }
type CustomerListResponse = { items: Customer[] }
type PersonnelItem = {
  id: string
  personnelName: string
  personnelNameDisplay: string | null
  skills: string
  projectId: string | null
}
type PersonnelListResponse = { items: PersonnelItem[] }
type Detail = {
  id: string
  projectName: string
  projectOverview: string
  projectDetail: string | null
  skills: string | null
  jobCategoryCodes: string[]
  ageFrom: number | null
  ageTo: number | null
  foreignAcceptanceCode: string
  billingRate: string | null
  unitPaymentPrice: string | null
  numberOfInterviews: number | null
  commercialFlowCode: string
  station: string | null
  beginDate: string
  endDate: string | null
  representativeSalesName: string | null
  customerId: string | null
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
const customers = ref<Customer[]>([])
const assignedPersonnel = ref<PersonnelItem[]>([])
const allPersonnel = ref<PersonnelItem[]>([])
const selectedPersonnelId = ref('')
const form = reactive({
  projectName: '',
  projectOverview: '',
  projectDetail: '',
  skills: '',
  jobCategoryCodes: [] as string[],
  ageFrom: null as number | null,
  ageTo: null as number | null,
  foreignAcceptanceCode: 'ACCEPTABLE',
  billingRate: null as number | null,
  unitPaymentPrice: null as number | null,
  numberOfInterviews: 1 as number | null,
  commercialFlowCode: '',
  station: '',
  beginDate: '',
  endDate: '',
  representativeSalesName: '',
  customerId: '',
  remarks: ''
})
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fieldErrors = ref<FieldErrors>({})

const schema = yup.object({
  projectName: yup.string().trim().required('案件名を入力してください。'),
  customerId: yup.string().required('取引先を選択してください。'),
  projectOverview: yup.string().trim().required('案件概要を入力してください。'),
  jobCategoryCodes: yup.array().of(yup.string().required()).min(1, '職種を1つ以上選択してください。'),
  commercialFlowCode: yup.string().required('商流を選択してください。'),
  beginDate: yup.string().required('期間Fromを入力してください。')
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
const customerName = computed(() =>
  customers.value.find((customer) => customer.id === detail.value?.customerId)?.companyName || detail.value?.customerId || '-'
)
const availablePersonnel = computed(() =>
  allPersonnel.value.filter((person) => !person.projectId || person.projectId === detail.value?.id)
)
const newPersonnelPath = computed(() => ({
  path: '/engineers/new',
  query: {
    projectId: String(route.params.id),
    returnTo: String(route.fullPath)
  }
}))

const syncForm = (item: Detail) => {
  form.projectName = item.projectName
  form.projectOverview = item.projectOverview
  form.projectDetail = item.projectDetail || ''
  form.skills = item.skills || ''
  form.jobCategoryCodes = [...(item.jobCategoryCodes || [])]
  form.ageFrom = item.ageFrom
  form.ageTo = item.ageTo
  form.foreignAcceptanceCode = item.foreignAcceptanceCode
  form.billingRate = item.billingRate ? Number(item.billingRate) : null
  form.unitPaymentPrice = item.unitPaymentPrice ? Number(item.unitPaymentPrice) : null
  form.numberOfInterviews = item.numberOfInterviews
  form.commercialFlowCode = item.commercialFlowCode
  form.station = item.station || ''
  form.beginDate = item.beginDate
  form.endDate = item.endDate || ''
  form.representativeSalesName = item.representativeSalesName || ''
  form.customerId = item.customerId || ''
  form.remarks = item.remarks || ''
}

const fetchCodes = async () => {
  const { data } = await $api.get<CodesResponse>('/codes', {
    params: { types: 'JOB_CATEGORY,COMMERCIAL_FLOW,FOREIGN_ACCEPTANCE' }
  })
  codes.value = data
}

const fetchCustomers = async () => {
  const { data } = await $api.get<CustomerListResponse>('/customers', {
    params: { page: 1, limit: 100 }
  })
  customers.value = data.items
}

const fetchAssignedPersonnel = async () => {
  const { data } = await $api.get<PersonnelListResponse>('/personnel', {
    params: { page: 1, limit: 100, projectId: route.params.id }
  })
  assignedPersonnel.value = data.items
}

const fetchAllPersonnel = async () => {
  const { data } = await $api.get<PersonnelListResponse>('/personnel', {
    params: { page: 1, limit: 100 }
  })
  allPersonnel.value = data.items
}

const fetchDetail = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.get<Detail>(`/projects/${route.params.id}`)
    detail.value = data
    syncForm(data)
  } catch {
    errorMessage.value = '案件情報の取得に失敗しました。'
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
    const { data } = await $api.patch<Detail>(`/projects/${route.params.id}`, {
      ...form,
      projectDetail: form.projectDetail || null,
      skills: form.skills || null,
      endDate: form.endDate || null,
      station: form.station || null,
      representativeSalesName: form.representativeSalesName || null,
      customerId: form.customerId || null,
      remarks: form.remarks || null
    })
    detail.value = data
    syncForm(data)
    editing.value = false
    successMessage.value = '案件情報を更新しました。'
  } catch {
    errorMessage.value = '案件情報の更新に失敗しました。入力内容を確認してください。'
  } finally {
    saving.value = false
  }
}

const assignPersonnel = async () => {
  if (!selectedPersonnelId.value) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $api.patch(`/personnel/${selectedPersonnelId.value}/assignment`, {
      projectId: route.params.id
    })
    selectedPersonnelId.value = ''
    await Promise.all([fetchAssignedPersonnel(), fetchAllPersonnel()])
    successMessage.value = '要員をアサインしました。'
  } catch {
    errorMessage.value = '要員のアサインに失敗しました。'
  }
}

const unassignPersonnel = async (person: PersonnelItem) => {
  if (!window.confirm(`要員「${person.personnelName}」のアサインを解除します。よろしいですか？`)) {
    return
  }

  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $api.patch(`/personnel/${person.id}/assignment`, {
      projectId: null
    })
    await Promise.all([fetchAssignedPersonnel(), fetchAllPersonnel()])
    successMessage.value = '要員のアサインを解除しました。'
  } catch {
    errorMessage.value = '要員のアサイン解除に失敗しました。'
  }
}

const deleteProject = async () => {
  if (!detail.value || !window.confirm(`案件「${detail.value.projectName}」を削除します。よろしいですか？`)) {
    return
  }

  try {
    await $api.delete(`/projects/${detail.value.id}`)
    await navigateTo(detail.value.customerId ? `/customers/${detail.value.customerId}` : '/projects')
  } catch {
    errorMessage.value = '案件の削除に失敗しました。'
  }
}

onMounted(async () => {
  await Promise.all([fetchCodes(), fetchCustomers()])
  await fetchDetail()
  await Promise.all([fetchAssignedPersonnel(), fetchAllPersonnel()])
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">{{ editing ? '案件編集' : '案件参照' }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ editing ? '案件の詳細情報を編集できます。' : '案件の詳細情報を確認できます。' }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" to="/projects">一覧へ戻る</v-btn>
        <v-btn v-if="!editing" color="primary" prepend-icon="mdi-pencil" :disabled="!detail" :to="`/projects/${route.params.id}/edit`">編集</v-btn>
        <v-btn v-if="!editing" color="error" prepend-icon="mdi-delete-outline" variant="outlined" :disabled="!detail" @click="deleteProject">削除</v-btn>
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
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.projectName" class="management-detail-field" :error-messages="fieldErrors.projectName" :readonly="!editing">
              <template #label><RequiredLabel>案件名</RequiredLabel></template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-if="editing" v-model="form.customerId" class="management-detail-field" clearable :error-messages="fieldErrors.customerId" item-title="companyName" item-value="id" :items="customers">
              <template #label><RequiredLabel>取引先</RequiredLabel></template>
            </v-select>
            <v-text-field v-else class="management-detail-field" label="取引先" :model-value="customerName" readonly />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.projectOverview" auto-grow class="management-detail-field" :error-messages="fieldErrors.projectOverview" :readonly="!editing" rows="2">
              <template #label><RequiredLabel>案件概要</RequiredLabel></template>
            </v-textarea>
          </v-col>
          <v-col cols="12"><v-textarea v-model="form.projectDetail" auto-grow class="management-detail-field" label="案件詳細" :readonly="!editing" rows="3" /></v-col>
          <v-col cols="12" md="6"><v-textarea v-model="form.skills" auto-grow class="management-detail-field" label="必要スキル" :readonly="!editing" rows="3" /></v-col>
          <v-col cols="12" md="6">
            <v-select v-if="editing" v-model="form.jobCategoryCodes" chips class="management-detail-field" closable-chips :error-messages="fieldErrors.jobCategoryCodes" :items="codeOptions('JOB_CATEGORY')" multiple>
              <template #label><RequiredLabel>職種</RequiredLabel></template>
            </v-select>
            <v-text-field v-else class="management-detail-field" label="職種" :model-value="form.jobCategoryCodes.map((code) => codeValue('JOB_CATEGORY', code)).join('、') || '-'" readonly />
          </v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="form.ageFrom" class="management-detail-field" label="年齢From" :readonly="!editing" type="number" /></v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="form.ageTo" class="management-detail-field" label="年齢To" :readonly="!editing" type="number" /></v-col>
          <v-col cols="12" md="3">
            <v-select v-if="editing" v-model="form.foreignAcceptanceCode" class="management-detail-field" :items="codeOptions('FOREIGN_ACCEPTANCE')" label="外国籍可否" />
            <v-text-field v-else class="management-detail-field" label="外国籍可否" :model-value="codeValue('FOREIGN_ACCEPTANCE', detail.foreignAcceptanceCode)" readonly />
          </v-col>
          <v-col cols="12" md="3"><v-text-field v-model.number="form.numberOfInterviews" class="management-detail-field" label="面談回数" :readonly="!editing" type="number" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model.number="form.billingRate" class="management-detail-field" label="請求単価" :readonly="!editing" type="number" /></v-col>
          <v-col cols="12" md="4"><v-text-field v-model.number="form.unitPaymentPrice" class="management-detail-field" label="支払単価" :readonly="!editing" type="number" /></v-col>
          <v-col cols="12" md="4">
            <v-select v-if="editing" v-model="form.commercialFlowCode" class="management-detail-field" :error-messages="fieldErrors.commercialFlowCode" :items="codeOptions('COMMERCIAL_FLOW')">
              <template #label><RequiredLabel>商流</RequiredLabel></template>
            </v-select>
            <v-text-field v-else class="management-detail-field" label="商流" :model-value="codeValue('COMMERCIAL_FLOW', detail.commercialFlowCode)" readonly />
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-model="form.station" class="management-detail-field" label="最寄駅" :readonly="!editing" /></v-col>
          <v-col cols="12" md="4">
            <v-text-field v-if="editing" v-model="form.beginDate" class="management-detail-field" :error-messages="fieldErrors.beginDate" type="date">
              <template #label><RequiredLabel>期間From</RequiredLabel></template>
            </v-text-field>
            <v-text-field v-else class="management-detail-field" label="期間From" :model-value="formatDate(detail.beginDate)" readonly />
          </v-col>
          <v-col cols="12" md="4"><v-text-field v-if="editing" v-model="form.endDate" class="management-detail-field" label="期間To" type="date" /><v-text-field v-else class="management-detail-field" label="期間To" :model-value="formatDate(detail.endDate)" readonly /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.representativeSalesName" class="management-detail-field" label="担当営業" :readonly="!editing" /></v-col>
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
        <div class="relationship-summary mb-5">
          <div class="relationship-metric">
            <div class="relationship-metric__label">取引先</div>
            <div class="relationship-metric__value relationship-metric__value--text">{{ customerName }}</div>
          </div>
          <div class="relationship-metric" :class="assignedPersonnel.length > 0 ? 'relationship-metric--success' : 'relationship-metric--warning'">
            <div class="relationship-metric__label">アサイン状況</div>
            <div class="relationship-metric__value">{{ assignedPersonnel.length > 0 ? `${assignedPersonnel.length}名` : '未' }}</div>
          </div>
          <div class="relationship-metric">
            <div class="relationship-metric__label">必要職種</div>
            <div class="relationship-metric__value relationship-metric__value--text">{{ form.jobCategoryCodes.map((code) => codeValue('JOB_CATEGORY', code)).join('、') || '-' }}</div>
          </div>
        </div>
        <div class="relationship-action-row mb-5">
          <v-select
            v-model="selectedPersonnelId"
            class="management-detail-field relationship-action-row__select"
            clearable
            density="compact"
            hide-details
            item-title="personnelName"
            item-value="id"
            :items="availablePersonnel"
            label="既存要員を選択"
          />
          <v-btn color="primary" prepend-icon="mdi-account-check-outline" :disabled="!selectedPersonnelId" @click="assignPersonnel">アサイン</v-btn>
          <v-btn prepend-icon="mdi-account-plus-outline" variant="outlined" :to="newPersonnelPath">要員を登録</v-btn>
        </div>
        <div class="d-flex align-center justify-space-between mb-3">
          <h2 class="text-subtitle-1 font-weight-bold">アサイン要員</h2>
          <v-btn prepend-icon="mdi-format-list-bulleted" variant="text" to="/engineers">要員一覧</v-btn>
        </div>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>要員名</th>
              <th>担当案件</th>
              <th>表示名</th>
              <th>スキル</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="person in assignedPersonnel" :key="person.id">
              <td><NuxtLink class="management-link" :to="`/engineers/${person.id}`">{{ person.personnelName }}</NuxtLink></td>
              <td><NuxtLink class="management-link" :to="`/projects/${route.params.id}`">{{ detail.projectName }}</NuxtLink></td>
              <td>{{ person.personnelNameDisplay || '-' }}</td>
              <td>{{ person.skills }}</td>
              <td>
                <div class="d-flex ga-1">
                  <v-btn density="comfortable" icon="mdi-pencil" :to="`/engineers/${person.id}/edit`" variant="text" />
                  <v-btn color="error" density="comfortable" icon="mdi-link-off" variant="text" @click="unassignPersonnel(person)" />
                </div>
              </td>
            </tr>
            <tr v-if="assignedPersonnel.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="5">この案件にアサインされた要員はありません。</td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>
  </div>
</template>

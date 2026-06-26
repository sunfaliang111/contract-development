<script setup lang="ts">
import * as yup from 'yup'
import type { FieldErrors } from '~/composables/useYupValidation'

type CustomerDetail = {
  id: string
  companyName: string
  companyNameKana: string | null
  representativeName: string | null
  postalCode: string | null
  address: string | null
  buildingName: string | null
  phoneNumber: string | null
  faxNumber: string | null
  invoiceNo: string | null
  siteUrl: string | null
  proposalCategoryCode: string | null
  importanceCode: string | null
  scheduledContractStartDate: string | null
  contractConclusionDate: string | null
  scheduledContractEndDate: string | null
  contractEndDate: string | null
  primarySales: string | null
  secondarySales: string | null
  remarks: string | null
  registeredBy: string
  registeredAt: string
  updatedBy: string
  updatedAt: string
}

type PostalCodeSearchResponse = {
  postalCode: string
  address: string | null
}
type Project = {
  id: string
  projectName: string
  projectOverview: string
  beginDate: string
  endDate: string | null
  representativeSalesName: string | null
}
type ProjectListResponse = { items: Project[] }

const { $api } = useNuxtApp()
const route = useRoute()

definePageMeta({
  layout: 'authenticated'
})

const customer = ref<CustomerDetail | null>(null)
const relatedProjects = ref<Project[]>([])
const form = reactive({
  companyName: '',
  companyNameKana: '',
  representativeName: '',
  postalCode: '',
  address: '',
  buildingName: '',
  phoneNumber: '',
  faxNumber: '',
  invoiceNo: '',
  siteUrl: '',
  proposalCategoryCode: '',
  importanceCode: '',
  scheduledContractStartDate: '',
  contractConclusionDate: '',
  scheduledContractEndDate: '',
  contractEndDate: '',
  primarySales: '',
  secondarySales: '',
  remarks: ''
})
const loading = ref(true)
const saving = ref(false)
const searchingPostalCode = ref(false)
const editing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const fieldErrors = ref<FieldErrors>({})

const schema = yup.object({
  companyName: yup.string().trim().required('企業名を入力してください。'),
  proposalCategoryCode: yup.string().required('提案区分を選択してください。'),
  primarySales: yup.string().trim().required('自社担当営業（主担当）を入力してください。'),
  siteUrl: yup.string().trim().url('URL形式で入力してください。').nullable().transform((value) => value || null)
})

const proposalCategoryItems = [
  { title: '案件', value: 'PROJECT' },
  { title: '人材', value: 'PERSONNEL' }
]
const importanceItems = [
  { title: '高', value: 'HIGH' },
  { title: '中', value: 'MIDDLE' },
  { title: '低', value: 'LOW' }
]

const pageTitle = computed(() => editing.value ? '取引先編集' : '取引先参照')
const pageDescription = computed(() =>
  editing.value ? '取引先の詳細情報を編集できます。' : '取引先の詳細情報を確認できます。'
)

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value))
}

const fetchRelatedProjects = async () => {
  const { data } = await $api.get<ProjectListResponse>('/projects', {
    params: { page: 1, limit: 100, customerId: route.params.id }
  })
  relatedProjects.value = data.items
}

const syncForm = (detail: CustomerDetail) => {
  form.companyName = detail.companyName
  form.companyNameKana = detail.companyNameKana || ''
  form.representativeName = detail.representativeName || ''
  form.postalCode = detail.postalCode || ''
  form.address = detail.address || ''
  form.buildingName = detail.buildingName || ''
  form.phoneNumber = detail.phoneNumber || ''
  form.faxNumber = detail.faxNumber || ''
  form.invoiceNo = detail.invoiceNo || ''
  form.siteUrl = detail.siteUrl || ''
  form.proposalCategoryCode = detail.proposalCategoryCode || ''
  form.importanceCode = detail.importanceCode || ''
  form.scheduledContractStartDate = detail.scheduledContractStartDate || ''
  form.contractConclusionDate = detail.contractConclusionDate || ''
  form.scheduledContractEndDate = detail.scheduledContractEndDate || ''
  form.contractEndDate = detail.contractEndDate || ''
  form.primarySales = detail.primarySales || ''
  form.secondarySales = detail.secondarySales || ''
  form.remarks = detail.remarks || ''
}

const fetchCustomer = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await $api.get<CustomerDetail>(`/customers/${route.params.id}`)
    customer.value = data
    syncForm(data)
  } catch {
    errorMessage.value = '取引先情報の取得に失敗しました。'
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  if (!customer.value) {
    return
  }

  syncForm(customer.value)
  successMessage.value = ''
  errorMessage.value = ''
  editing.value = true
}

const cancelEdit = () => {
  if (customer.value) {
    syncForm(customer.value)
  }

  editing.value = false
  errorMessage.value = ''
  fieldErrors.value = {}
}

const searchAddressByPostalCode = async () => {
  if (!editing.value || searchingPostalCode.value) {
    return
  }

  const normalizedPostalCode = form.postalCode.replace(/\D/g, '')
  if (normalizedPostalCode.length !== 7) {
    return
  }

  searchingPostalCode.value = true
  errorMessage.value = ''

  try {
    const { data } = await $api.get<PostalCodeSearchResponse>('/customers/postal-code/search', {
      params: {
        postalCode: form.postalCode
      }
    })

    form.postalCode = data.postalCode
    if (data.address) {
      form.address = data.address
    } else {
      errorMessage.value = '郵便番号に該当する住所が見つかりませんでした。'
    }
  } catch {
    errorMessage.value = '住所の自動取得に失敗しました。手入力してください。'
  } finally {
    searchingPostalCode.value = false
  }
}

const saveCustomer = async () => {
  fieldErrors.value = await validateYupForm(schema, form)
  if (Object.keys(fieldErrors.value).length > 0) return

  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { data } = await $api.patch<CustomerDetail>(`/customers/${route.params.id}`, {
      ...form,
      companyNameKana: form.companyNameKana || null,
      representativeName: form.representativeName || null,
      postalCode: form.postalCode || null,
      address: form.address || null,
      buildingName: form.buildingName || null,
      phoneNumber: form.phoneNumber || null,
      faxNumber: form.faxNumber || null,
      invoiceNo: form.invoiceNo || null,
      siteUrl: form.siteUrl || null,
      proposalCategoryCode: form.proposalCategoryCode || null,
      importanceCode: form.importanceCode || null,
      scheduledContractStartDate: form.scheduledContractStartDate || null,
      contractConclusionDate: form.contractConclusionDate || null,
      scheduledContractEndDate: form.scheduledContractEndDate || null,
      contractEndDate: form.contractEndDate || null,
      primarySales: form.primarySales || null,
      secondarySales: form.secondarySales || null,
      remarks: form.remarks || null
    })
    customer.value = data
    syncForm(data)
    editing.value = false
    successMessage.value = '取引先情報を更新しました。'
  } catch {
    errorMessage.value = '取引先情報の更新に失敗しました。入力内容を確認してください。'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await fetchCustomer()
  await fetchRelatedProjects()
})
</script>

<template>
  <div class="customer-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">{{ pageTitle }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">{{ pageDescription }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" to="/customers">一覧へ戻る</v-btn>
        <v-btn
          v-if="!editing"
          color="primary"
          prepend-icon="mdi-pencil"
          :disabled="!customer"
          @click="startEdit"
        >
          編集
        </v-btn>
        <template v-else>
          <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" @click="cancelEdit">
            キャンセル
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="saveCustomer">
            保存
          </v-btn>
        </template>
      </div>
    </div>

    <v-alert
      v-if="successMessage"
      class="mb-5"
      density="comfortable"
      type="success"
      variant="tonal"
    >
      {{ successMessage }}
    </v-alert>

    <v-alert
      v-if="errorMessage"
      class="mb-5"
      density="comfortable"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card class="customer-detail-card pa-5 pa-md-6">
      <v-progress-linear v-if="loading" class="mb-5" color="primary" indeterminate />

      <template v-if="customer">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.companyName"
              class="customer-detail-field"
              :error-messages="fieldErrors.companyName"
              :readonly="!editing"
            >
              <template #label><RequiredLabel>企業名</RequiredLabel></template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.companyNameKana"
              class="customer-detail-field"
              label="企業名かな"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.representativeName"
              class="customer-detail-field"
              label="法人代表"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.postalCode"
              class="customer-detail-field"
              :append-inner-icon="editing ? 'mdi-map-search-outline' : undefined"
              label="郵便番号"
              :loading="searchingPostalCode"
              :readonly="!editing"
              @blur="searchAddressByPostalCode"
              @click:append-inner="searchAddressByPostalCode"
            />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.address"
              class="customer-detail-field"
              label="住所"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.buildingName"
              class="customer-detail-field"
              label="ビル名"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.phoneNumber"
              class="customer-detail-field"
              label="電話番号"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.faxNumber"
              class="customer-detail-field"
              label="FAX番号"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.invoiceNo"
              class="customer-detail-field"
              label="適格請求書発行事業者登録番号"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.siteUrl"
              class="customer-detail-field"
              :error-messages="fieldErrors.siteUrl"
              label="サイトURL"
              :readonly="!editing"
            />
          </v-col>
          <v-col class="d-flex align-center pb-5" cols="12" md="4">
            <v-btn
              v-if="customer.siteUrl"
              append-icon="mdi-open-in-new"
              color="primary"
              :href="customer.siteUrl"
              rel="noopener noreferrer"
              target="_blank"
              variant="text"
            >
              サイトを開く
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="form.proposalCategoryCode"
              class="customer-detail-field"
              clearable
              :error-messages="fieldErrors.proposalCategoryCode"
              :items="proposalCategoryItems"
              :readonly="!editing"
            >
              <template #label><RequiredLabel>提案区分</RequiredLabel></template>
            </v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="form.importanceCode"
              class="customer-detail-field"
              clearable
              :items="importanceItems"
              label="重要度"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-if="editing"
              v-model="form.scheduledContractStartDate"
              class="customer-detail-field"
              label="契約開始予定日"
              type="date"
            />
            <v-text-field
              v-else
              class="customer-detail-field"
              label="契約開始予定日"
              :model-value="formatDate(customer.scheduledContractStartDate)"
              readonly
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-if="editing"
              v-model="form.contractConclusionDate"
              class="customer-detail-field"
              label="契約締結日"
              type="date"
            />
            <v-text-field
              v-else
              class="customer-detail-field"
              label="契約締結日"
              :model-value="formatDate(customer.contractConclusionDate)"
              readonly
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-if="editing"
              v-model="form.scheduledContractEndDate"
              class="customer-detail-field"
              label="契約終了予定日"
              type="date"
            />
            <v-text-field
              v-else
              class="customer-detail-field"
              label="契約終了予定日"
              :model-value="formatDate(customer.scheduledContractEndDate)"
              readonly
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-if="editing"
              v-model="form.contractEndDate"
              class="customer-detail-field"
              label="契約終了日"
              type="date"
            />
            <v-text-field
              v-else
              class="customer-detail-field"
              label="契約終了日"
              :model-value="formatDate(customer.contractEndDate)"
              readonly
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.primarySales"
              class="customer-detail-field"
              :error-messages="fieldErrors.primarySales"
              :readonly="!editing"
            >
              <template #label><RequiredLabel>自社担当営業（主担当）</RequiredLabel></template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.secondarySales"
              class="customer-detail-field"
              label="自社担当営業（副担当）"
              :readonly="!editing"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.remarks"
              auto-grow
              class="customer-detail-field"
              label="備考"
              :readonly="!editing"
              rows="3"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              class="customer-detail-field customer-detail-field--readonly"
              label="登録者"
              :model-value="customer.registeredBy"
              readonly
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              class="customer-detail-field customer-detail-field--readonly"
              label="登録日時"
              :model-value="formatDateTime(customer.registeredAt)"
              readonly
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              class="customer-detail-field customer-detail-field--readonly"
              label="更新者"
              :model-value="customer.updatedBy"
              readonly
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              class="customer-detail-field customer-detail-field--readonly"
              label="更新日時"
              :model-value="formatDateTime(customer.updatedAt)"
              readonly
            />
          </v-col>
        </v-row>

        <div v-if="editing" class="customer-detail-actions mt-4">
          <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" @click="cancelEdit">
            キャンセル
          </v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="saveCustomer">
            保存
          </v-btn>
        </div>
        <v-divider class="my-6" />
        <div class="d-flex align-center justify-space-between mb-3">
          <h2 class="text-subtitle-1 font-weight-bold">関連案件</h2>
          <v-btn prepend-icon="mdi-plus" variant="outlined" to="/projects/new">案件を登録</v-btn>
        </div>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>案件名</th>
              <th>概要</th>
              <th>期間</th>
              <th>担当営業</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in relatedProjects" :key="project.id">
              <td><NuxtLink class="management-link" :to="`/projects/${project.id}`">{{ project.projectName }}</NuxtLink></td>
              <td>{{ project.projectOverview }}</td>
              <td>{{ formatDate(project.beginDate) }} ～ {{ formatDate(project.endDate) }}</td>
              <td>{{ project.representativeSalesName || '-' }}</td>
            </tr>
            <tr v-if="relatedProjects.length === 0">
              <td class="text-center text-medium-emphasis py-6" colspan="4">この取引先に紐づく案件はありません。</td>
            </tr>
          </tbody>
        </v-table>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FieldErrors } from '~/composables/useYupValidation'

type CodeItem = { code: string; codeValue: string }
type CodesResponse = Record<string, CodeItem[]>
type Detail = { id: string }
type Customer = { id: string; companyName: string }
type CustomerListResponse = { items: Customer[] }

const { $api } = useNuxtApp()
const route = useRoute()

definePageMeta({ layout: 'authenticated' })

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
  numberOfInterviews: 1,
  commercialFlowCode: '',
  station: '',
  beginDate: '',
  endDate: '',
  representativeSalesName: '',
  customerId: '',
  remarks: ''
})

const codes = ref<CodesResponse>({})
const customers = ref<Customer[]>([])
const saving = ref(false)
const errorMessage = ref('')
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
const returnTo = computed(() => typeof route.query.returnTo === 'string' ? route.query.returnTo : '')
const cancelTo = computed(() => returnTo.value || '/projects')
const selectedCustomer = computed(() => customers.value.find((customer) => customer.id === form.customerId) || null)
const selectedCustomerName = computed(() => selectedCustomer.value?.companyName || '未選択')
const selectedJobCategoryText = computed(() => {
  const values = form.jobCategoryCodes.map((code) =>
    codes.value.JOB_CATEGORY?.find((item) => item.code === code)?.codeValue || code
  )
  return values.length > 0 ? values.join('、') : '未選択'
})

const fetchCodes = async () => {
  const { data } = await $api.get<CodesResponse>('/codes', {
    params: { types: 'JOB_CATEGORY,COMMERCIAL_FLOW,FOREIGN_ACCEPTANCE' }
  })
  codes.value = data
  form.commercialFlowCode ||= data.COMMERCIAL_FLOW?.[0]?.code || ''
}

const fetchCustomers = async () => {
  const { data } = await $api.get<CustomerListResponse>('/customers', {
    params: { page: 1, limit: 100 }
  })
  customers.value = data.items
  if (typeof route.query.customerId === 'string') {
    form.customerId = route.query.customerId
  }
}

const createProject = async () => {
  fieldErrors.value = await validateYupForm(schema, form)
  if (Object.keys(fieldErrors.value).length > 0) return

  saving.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.post<Detail>('/projects', {
      ...form,
      projectDetail: form.projectDetail || null,
      skills: form.skills || null,
      endDate: form.endDate || null,
      station: form.station || null,
      representativeSalesName: form.representativeSalesName || null,
      customerId: form.customerId || null,
      remarks: form.remarks || null
    })
    await navigateTo(returnTo.value || `/projects/${data.id}`)
  } catch {
    errorMessage.value = '案件情報の登録に失敗しました。入力内容を確認してください。'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchCodes(), fetchCustomers()])
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">案件新規</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">新しい案件情報を登録できます。</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" :to="cancelTo">一覧へ戻る</v-btn>
        <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" :to="cancelTo">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="createProject">保存</v-btn>
      </div>
    </div>
    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>
    <v-card class="management-detail-card pa-5 pa-md-6">
      <div class="relationship-summary mb-5">
        <div class="relationship-metric">
          <div class="relationship-metric__label">取引先</div>
          <div class="relationship-metric__value relationship-metric__value--text">{{ selectedCustomerName }}</div>
        </div>
        <div class="relationship-metric">
          <div class="relationship-metric__label">要員アサイン</div>
          <div class="relationship-metric__value relationship-metric__value--text">登録後に設定</div>
        </div>
        <div class="relationship-metric">
          <div class="relationship-metric__label">職種</div>
          <div class="relationship-metric__value relationship-metric__value--text">{{ selectedJobCategoryText }}</div>
        </div>
      </div>
      <v-row dense>
        <v-col cols="12"><div class="form-section-title">基本情報</div></v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.projectName" class="management-detail-field" :error-messages="fieldErrors.projectName">
            <template #label><RequiredLabel>案件名</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.customerId" class="management-detail-field" clearable :error-messages="fieldErrors.customerId" item-title="companyName" item-value="id" :items="customers">
            <template #label><RequiredLabel>取引先</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="form.projectOverview" auto-grow class="management-detail-field" :error-messages="fieldErrors.projectOverview" rows="2">
            <template #label><RequiredLabel>案件概要</RequiredLabel></template>
          </v-textarea>
        </v-col>
        <v-col cols="12"><v-textarea v-model="form.projectDetail" auto-grow class="management-detail-field" label="案件詳細" rows="3" /></v-col>
        <v-col cols="12"><div class="form-section-title mt-2">要件・条件</div></v-col>
        <v-col cols="12" md="6"><v-textarea v-model="form.skills" auto-grow class="management-detail-field" label="必要スキル" rows="3" /></v-col>
        <v-col cols="12" md="6">
          <v-select v-model="form.jobCategoryCodes" chips class="management-detail-field" closable-chips :error-messages="fieldErrors.jobCategoryCodes" :items="codeOptions('JOB_CATEGORY')" multiple>
            <template #label><RequiredLabel>職種</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.ageFrom" class="management-detail-field" label="年齢From" type="number" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.ageTo" class="management-detail-field" label="年齢To" type="number" /></v-col>
        <v-col cols="12" md="3"><v-select v-model="form.foreignAcceptanceCode" class="management-detail-field" :items="codeOptions('FOREIGN_ACCEPTANCE')" label="外国籍可否" /></v-col>
        <v-col cols="12" md="3"><v-text-field v-model.number="form.numberOfInterviews" class="management-detail-field" label="面談回数" type="number" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="form.billingRate" class="management-detail-field" label="請求単価" type="number" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="form.unitPaymentPrice" class="management-detail-field" label="支払単価" type="number" /></v-col>
        <v-col cols="12" md="4">
          <v-select v-model="form.commercialFlowCode" class="management-detail-field" :error-messages="fieldErrors.commercialFlowCode" :items="codeOptions('COMMERCIAL_FLOW')">
            <template #label><RequiredLabel>商流</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12"><div class="form-section-title mt-2">期間・営業</div></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.station" class="management-detail-field" label="最寄駅" /></v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.beginDate" class="management-detail-field" :error-messages="fieldErrors.beginDate" type="date">
            <template #label><RequiredLabel>期間From</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.endDate" class="management-detail-field" label="期間To" type="date" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.representativeSalesName" class="management-detail-field" label="担当営業" /></v-col>
        <v-col cols="12"><v-textarea v-model="form.remarks" auto-grow class="management-detail-field" label="備考" rows="3" /></v-col>
      </v-row>
      <div class="management-detail-actions mt-4">
        <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" :to="cancelTo">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="createProject">保存</v-btn>
      </div>
    </v-card>
  </div>
</template>

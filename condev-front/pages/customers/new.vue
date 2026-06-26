<script setup lang="ts">
import * as yup from 'yup'
import type { FieldErrors } from '~/composables/useYupValidation'

type CustomerDetail = { id: string }
type PostalCodeSearchResponse = { postalCode: string; address: string | null }

const { $api } = useNuxtApp()

definePageMeta({ layout: 'authenticated' })

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

const saving = ref(false)
const searchingPostalCode = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<FieldErrors>({})

const schema = yup.object({
  companyName: yup.string().trim().required('企業名を入力してください。'),
  proposalCategoryCode: yup.string().required('提案区分を選択してください。'),
  primarySales: yup.string().trim().required('自社担当営業（主担当）を入力してください。'),
  siteUrl: yup.string().trim().url('URL形式で入力してください。').nullable().transform((value) => value || null),
  scheduledContractStartDate: yup.string().nullable(),
  contractConclusionDate: yup.string().nullable(),
  scheduledContractEndDate: yup.string().nullable(),
  contractEndDate: yup.string().nullable()
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

const searchAddressByPostalCode = async () => {
  if (searchingPostalCode.value) return
  const normalizedPostalCode = form.postalCode.replace(/\D/g, '')
  if (normalizedPostalCode.length !== 7) return

  searchingPostalCode.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.get<PostalCodeSearchResponse>('/customers/postal-code/search', {
      params: { postalCode: form.postalCode }
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

const createCustomer = async () => {
  fieldErrors.value = await validateYupForm(schema, form)
  if (Object.keys(fieldErrors.value).length > 0) return

  saving.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.post<CustomerDetail>('/customers', {
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
    await navigateTo(`/customers/${data.id}`)
  } catch {
    errorMessage.value = '取引先情報の登録に失敗しました。入力内容を確認してください。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="customer-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">取引先新規</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">新しい取引先情報を登録できます。</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" to="/customers">一覧へ戻る</v-btn>
        <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" to="/customers">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="createCustomer">保存</v-btn>
      </div>
    </div>
    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>
    <v-card class="customer-detail-card pa-5 pa-md-6">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.companyName" class="customer-detail-field" :error-messages="fieldErrors.companyName">
            <template #label><RequiredLabel>企業名</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.companyNameKana" class="customer-detail-field" label="企業名かな" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.representativeName" class="customer-detail-field" label="法人代表" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.postalCode" append-inner-icon="mdi-map-search-outline" class="customer-detail-field" label="郵便番号" :loading="searchingPostalCode" @blur="searchAddressByPostalCode" @click:append-inner="searchAddressByPostalCode" /></v-col>
        <v-col cols="12" md="8"><v-text-field v-model="form.address" class="customer-detail-field" label="住所" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.buildingName" class="customer-detail-field" label="ビル名" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.phoneNumber" class="customer-detail-field" label="電話番号" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.faxNumber" class="customer-detail-field" label="FAX番号" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.invoiceNo" class="customer-detail-field" label="適格請求書発行事業者登録番号" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.siteUrl" class="customer-detail-field" :error-messages="fieldErrors.siteUrl" label="サイトURL" /></v-col>
        <v-col cols="12" md="4">
          <v-select v-model="form.proposalCategoryCode" class="customer-detail-field" clearable :error-messages="fieldErrors.proposalCategoryCode" :items="proposalCategoryItems">
            <template #label><RequiredLabel>提案区分</RequiredLabel></template>
          </v-select>
        </v-col>
        <v-col cols="12" md="4"><v-select v-model="form.importanceCode" class="customer-detail-field" clearable :items="importanceItems" label="重要度" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.scheduledContractStartDate" class="customer-detail-field" label="契約開始予定日" type="date" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.contractConclusionDate" class="customer-detail-field" label="契約締結日" type="date" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.scheduledContractEndDate" class="customer-detail-field" label="契約終了予定日" type="date" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.contractEndDate" class="customer-detail-field" label="契約終了日" type="date" /></v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.primarySales" class="customer-detail-field" :error-messages="fieldErrors.primarySales">
            <template #label><RequiredLabel>自社担当営業（主担当）</RequiredLabel></template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4"><v-text-field v-model="form.secondarySales" class="customer-detail-field" label="自社担当営業（副担当）" /></v-col>
        <v-col cols="12"><v-textarea v-model="form.remarks" auto-grow class="customer-detail-field" label="備考" rows="3" /></v-col>
      </v-row>
      <div class="customer-detail-actions mt-4">
        <v-btn prepend-icon="mdi-close" variant="outlined" :disabled="saving" to="/customers">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="createCustomer">保存</v-btn>
      </div>
    </v-card>
  </div>
</template>

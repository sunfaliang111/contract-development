<script setup lang="ts">
type Customer = {
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
  importanceCode: string | null
  contractConclusionDate: string | null
  primarySales: string | null
  secondarySales: string | null
  remarks: string | null
  registeredAt: string
  updatedAt: string
  registeredBy: string
  updatedBy: string
}

type CustomerSearchField = 'companyName' | 'representativeName' | 'address' | 'phoneNumber'

type CustomerListResponse = {
  items: Customer[]
  total: number
  page: number
  limit: number
  lastPage: number
}

const { $api } = useNuxtApp()

definePageMeta({
  layout: 'authenticated'
})

const customers = ref<Customer[]>([])
const loading = ref(true)
const errorMessage = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const lastPage = ref(1)
const jumpPage = ref(1)
const searchField = ref<CustomerSearchField>('companyName')
const keyword = ref('')
const sortKey = ref('companyName')
const sortDirection = ref<'asc' | 'desc'>('asc')
const columnFilters = reactive<Record<string, string>>({})

const searchFields = [
  { title: '企業名', value: 'companyName' },
  { title: '法人代表', value: 'representativeName' },
  { title: '住所', value: 'address' },
  { title: '電話番号', value: 'phoneNumber' }
]

const pageSummary = computed(() => {
  if (total.value === 0) {
    return '0件'
  }

  const from = (page.value - 1) * limit.value + 1
  const to = Math.min(page.value * limit.value, total.value)
  return `${from}～${to}件 / 全${total.value}件`
})

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

const customerColumnValue = (customer: Customer, column: string) => {
  switch (column) {
    case 'companyName': return customer.companyName
    case 'representativeName': return customer.representativeName || ''
    case 'address': return customer.address || ''
    case 'phoneNumber': return customer.phoneNumber || ''
    case 'faxNumber': return customer.faxNumber || ''
    case 'invoiceNo': return customer.invoiceNo || ''
    case 'registeredBy': return customer.registeredBy
    case 'updatedBy': return customer.updatedBy
    case 'registeredAt': return customer.registeredAt
    case 'updatedAt': return customer.updatedAt
    default: return ''
  }
}

const compareValues = (left: string, right: string) => left.localeCompare(right, 'ja', {
  numeric: true,
  sensitivity: 'base'
})

const visibleCustomers = computed(() => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value)
  return [...customers.value]
    .filter((customer) => activeFilters.every(([column, value]) =>
      customerColumnValue(customer, column).toLowerCase().includes(value.toLowerCase())
    ))
    .sort((left, right) => {
      const result = compareValues(customerColumnValue(left, sortKey.value), customerColumnValue(right, sortKey.value))
      return sortDirection.value === 'asc' ? result : -result
    })
})

const sortBy = (column: string) => {
  if (sortKey.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortKey.value = column
  sortDirection.value = 'asc'
}

const filterBy = (column: string, value: string) => {
  columnFilters[column] = value
}

const fetchCustomers = async (targetPage = page.value) => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await $api.get<CustomerListResponse>('/customers', {
      params: {
        page: targetPage,
        limit: limit.value,
        searchField: searchField.value,
        keyword: keyword.value
      }
    })

    customers.value = data.items
    total.value = data.total
    page.value = data.page
    lastPage.value = data.lastPage
    jumpPage.value = data.page
  } catch {
    errorMessage.value = '取引先情報の取得に失敗しました。再ログインしてください。'
  } finally {
    loading.value = false
  }
}

const search = async () => {
  await fetchCustomers(1)
}

const clearSearch = async () => {
  searchField.value = 'companyName'
  keyword.value = ''
  await fetchCustomers(1)
}

const goToPage = async (targetPage: number) => {
  const normalizedPage = Math.min(Math.max(Math.trunc(targetPage || 1), 1), lastPage.value)
  await fetchCustomers(normalizedPage)
}

const jump = async () => {
  await goToPage(jumpPage.value)
}

onMounted(async () => {
  await fetchCustomers()
})
</script>

<template>
  <div class="customer-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">取引先一覧</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">登録済み取引先の基本情報を確認できます。</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/customers/new">新規登録</v-btn>
    </div>

    <v-card class="customer-search-card pa-4 mb-5">
      <v-row align="center" dense>
        <v-col cols="12" md="3">
          <v-select
            v-model="searchField"
            density="compact"
            hide-details
            item-title="title"
            item-value="value"
            :items="searchFields"
            label="検索項目"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="keyword"
            density="compact"
            hide-details
            label="キーワード"
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="search"
          />
        </v-col>
        <v-col class="d-flex ga-2 justify-end" cols="12" md="3">
          <v-btn color="primary" prepend-icon="mdi-magnify" @click="search">検索</v-btn>
          <v-btn prepend-icon="mdi-close" variant="outlined" @click="clearSearch">クリア</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-alert
      v-if="errorMessage"
      class="mb-5"
      density="comfortable"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card class="customer-table-card">
      <v-progress-linear v-if="loading" color="primary" indeterminate />

      <v-table fixed-header height="calc(100vh - 360px)">
        <thead>
          <tr>
            <th><ListHeaderCell column="companyName" filterable label="企業名" :filter-value="columnFilters.companyName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="representativeName" filterable label="法人代表" :filter-value="columnFilters.representativeName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="address" filterable label="住所" :filter-value="columnFilters.address" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="phoneNumber" filterable label="電話番号" :filter-value="columnFilters.phoneNumber" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="faxNumber" filterable label="FAX番号" :filter-value="columnFilters.faxNumber" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="invoiceNo" filterable label="登録番号" :filter-value="columnFilters.invoiceNo" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="registeredAt" label="登録日時" :filterable="false" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="updatedAt" label="更新日時" :filterable="false" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="registeredBy" filterable label="登録者" :filter-value="columnFilters.registeredBy" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="updatedBy" filterable label="更新者" :filter-value="columnFilters.updatedBy" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in visibleCustomers" :key="customer.id">
            <td class="font-weight-medium">
              <NuxtLink class="customer-company-link" :to="`/customers/${customer.id}`">
                {{ customer.companyName }}
              </NuxtLink>
            </td>
            <td>{{ customer.representativeName || '-' }}</td>
            <td class="address-cell">{{ customer.address || '-' }}</td>
            <td>{{ customer.phoneNumber || '-' }}</td>
            <td>{{ customer.faxNumber || '-' }}</td>
            <td>{{ customer.invoiceNo || '-' }}</td>
            <td>{{ formatDateTime(customer.registeredAt) }}</td>
            <td>{{ formatDateTime(customer.updatedAt) }}</td>
            <td>{{ customer.registeredBy }}</td>
            <td>{{ customer.updatedBy }}</td>
          </tr>
          <tr v-if="!loading && visibleCustomers.length === 0">
            <td class="text-center text-medium-emphasis py-10" colspan="10">
              取引先情報がありません。
            </td>
          </tr>
        </tbody>
      </v-table>

      <div class="customer-pagination">
        <div class="text-body-2 text-medium-emphasis">{{ pageSummary }}</div>

        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            density="comfortable"
            icon="mdi-page-first"
            :disabled="loading || page <= 1"
            variant="outlined"
            @click="goToPage(1)"
          />
          <v-btn
            density="comfortable"
            icon="mdi-chevron-left"
            :disabled="loading || page <= 1"
            variant="outlined"
            @click="goToPage(page - 1)"
          />

          <span class="text-body-2">{{ page }} / {{ lastPage }}</span>

          <v-btn
            density="comfortable"
            icon="mdi-chevron-right"
            :disabled="loading || page >= lastPage"
            variant="outlined"
            @click="goToPage(page + 1)"
          />
          <v-btn
            density="comfortable"
            icon="mdi-page-last"
            :disabled="loading || page >= lastPage"
            variant="outlined"
            @click="goToPage(lastPage)"
          />

          <v-text-field
            v-model.number="jumpPage"
            class="page-jump-input"
            density="compact"
            hide-details
            min="1"
            :max="lastPage"
            type="number"
            @keyup.enter="jump"
          />
          <v-btn color="primary" :disabled="loading" variant="flat" @click="jump">移動</v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

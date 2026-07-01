<script setup lang="ts">
type Personnel = {
  id: string
  personnelName: string
  personnelNameDisplay: string | null
  contractTypeCode: string
  skills: string
  station: string | null
  projectId: string | null
  representativeSalesName: string | null
  registeredAt: string
  updatedAt: string
  registeredBy: string
  updatedBy: string
}

type SearchField = 'personnelName' | 'skills' | 'station' | 'representativeSalesName'
type ListResponse = { items: Personnel[]; total: number; page: number; limit: number; lastPage: number }
type Project = { id: string; projectName: string; customerId: string | null }
type ProjectListResponse = { items: Project[] }
type Customer = { id: string; companyName: string }
type CustomerListResponse = { items: Customer[] }

const { $api } = useNuxtApp()

definePageMeta({ layout: 'authenticated' })

const personnel = ref<Personnel[]>([])
const projects = ref<Project[]>([])
const customers = ref<Customer[]>([])
const loading = ref(true)
const errorMessage = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const lastPage = ref(1)
const jumpPage = ref(1)
const searchField = ref<SearchField>('personnelName')
const keyword = ref('')
const sortKey = ref('personnelName')
const sortDirection = ref<'asc' | 'desc'>('asc')
const columnFilters = reactive<Record<string, string>>({})

const searchFields = [
  { title: '要員名', value: 'personnelName' },
  { title: 'スキル', value: 'skills' },
  { title: '最寄駅', value: 'station' },
  { title: '担当営業', value: 'representativeSalesName' }
]

const pageSummary = computed(() => {
  if (total.value === 0) return '0件'
  const from = (page.value - 1) * limit.value + 1
  const to = Math.min(page.value * limit.value, total.value)
  return `${from}～${to}件 / 全${total.value}件`
})

const formatDateTime = (value: string) => new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(value))
const projectName = (projectId: string | null) => projects.value.find((project) => project.id === projectId)?.projectName || projectId || ''
const customerName = (customerId: string | null) => customers.value.find((customer) => customer.id === customerId)?.companyName || customerId || '-'
const projectCustomer = (projectId: string | null) => {
  const project = projects.value.find((item) => item.id === projectId)
  return project?.customerId ? customerName(project.customerId) : '-'
}
const projectCustomerId = (projectId: string | null) => projects.value.find((item) => item.id === projectId)?.customerId || ''

const personnelColumnValue = (item: Personnel, column: string) => {
  switch (column) {
    case 'personnelName': return item.personnelName
    case 'personnelNameDisplay': return item.personnelNameDisplay || ''
    case 'skills': return item.skills || ''
    case 'projectName': return projectName(item.projectId)
    case 'customerName': return projectCustomer(item.projectId)
    case 'station': return item.station || ''
    case 'representativeSalesName': return item.representativeSalesName || ''
    case 'registeredAt': return item.registeredAt
    case 'updatedAt': return item.updatedAt
    case 'registeredBy': return item.registeredBy
    case 'updatedBy': return item.updatedBy
    default: return ''
  }
}

const compareValues = (left: string, right: string) => left.localeCompare(right, 'ja', {
  numeric: true,
  sensitivity: 'base'
})

const visiblePersonnel = computed(() => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value)
  return [...personnel.value]
    .filter((item) => activeFilters.every(([column, value]) =>
      personnelColumnValue(item, column).toLowerCase().includes(value.toLowerCase())
    ))
    .sort((left, right) => {
      const result = compareValues(personnelColumnValue(left, sortKey.value), personnelColumnValue(right, sortKey.value))
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

const fetchCustomers = async () => {
  const { data } = await $api.get<CustomerListResponse>('/customers', {
    params: { page: 1, limit: 100 }
  })
  customers.value = data.items
}

const fetchProjects = async () => {
  const { data } = await $api.get<ProjectListResponse>('/projects', {
    params: { page: 1, limit: 100 }
  })
  projects.value = data.items
}

const fetchPersonnel = async (targetPage = page.value) => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.get<ListResponse>('/personnel', {
      params: { page: targetPage, limit: limit.value, searchField: searchField.value, keyword: keyword.value }
    })
    personnel.value = data.items
    total.value = data.total
    page.value = data.page
    lastPage.value = data.lastPage
    jumpPage.value = data.page
  } catch {
    errorMessage.value = '要員情報の取得に失敗しました。再ログインしてください。'
  } finally {
    loading.value = false
  }
}

const search = async () => fetchPersonnel(1)
const clearSearch = async () => {
  searchField.value = 'personnelName'
  keyword.value = ''
  await fetchPersonnel(1)
}
const goToPage = async (targetPage: number) => fetchPersonnel(Math.min(Math.max(Math.trunc(targetPage || 1), 1), lastPage.value))
const jump = async () => goToPage(jumpPage.value)

onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchProjects(), fetchPersonnel()])
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">要員一覧</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">登録済み要員の基本情報を確認できます。</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/engineers/new">新規登録</v-btn>
    </div>
    <v-card class="management-search-card pa-4 mb-5">
      <v-row align="center" dense>
        <v-col cols="12" md="3"><v-select v-model="searchField" density="compact" hide-details item-title="title" item-value="value" :items="searchFields" label="検索項目" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="keyword" density="compact" hide-details label="キーワード" prepend-inner-icon="mdi-magnify" @keyup.enter="search" /></v-col>
        <v-col class="d-flex ga-2 justify-end" cols="12" md="3">
          <v-btn color="primary" prepend-icon="mdi-magnify" @click="search">検索</v-btn>
          <v-btn prepend-icon="mdi-close" variant="outlined" @click="clearSearch">クリア</v-btn>
        </v-col>
      </v-row>
    </v-card>
    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>
    <v-card class="management-table-card">
      <v-progress-linear v-if="loading" color="primary" indeterminate />
      <v-table fixed-header height="calc(100vh - 360px)">
        <thead>
          <tr>
            <th><ListHeaderCell column="personnelName" filterable label="要員名" :filter-value="columnFilters.personnelName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="personnelNameDisplay" filterable label="表示名" :filter-value="columnFilters.personnelNameDisplay" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="skills" filterable label="スキル" :filter-value="columnFilters.skills" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell label="経歴書" :filterable="false" :sortable="false" /></th>
            <th><ListHeaderCell column="projectName" filterable label="担当案件" :filter-value="columnFilters.projectName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="customerName" filterable label="取引先" :filter-value="columnFilters.customerName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="station" filterable label="最寄駅" :filter-value="columnFilters.station" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="representativeSalesName" filterable label="担当営業" :filter-value="columnFilters.representativeSalesName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="registeredAt" label="登録日時" :filterable="false" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="registeredBy" filterable label="登録者" :filter-value="columnFilters.registeredBy" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="updatedAt" label="更新日時" :filterable="false" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
            <th><ListHeaderCell column="updatedBy" filterable label="更新者" :filter-value="columnFilters.updatedBy" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visiblePersonnel" :key="item.id">
            <td class="font-weight-medium"><NuxtLink class="management-link" :to="`/engineers/${item.id}`">{{ item.personnelName }}</NuxtLink></td>
            <td>{{ item.personnelNameDisplay || '-' }}</td>
            <td class="wide-cell">{{ item.skills }}</td>
            <td>
              <v-btn
                color="primary"
                density="comfortable"
                prepend-icon="mdi-file-account-outline"
                size="small"
                :to="`/resumes?personnelId=${item.id}`"
                variant="tonal"
              >
                経歴書
              </v-btn>
            </td>
            <td>
              <NuxtLink v-if="item.projectId" class="management-link" :to="`/projects/${item.projectId}`">{{ projectName(item.projectId) }}</NuxtLink>
              <span v-else class="assignment-status assignment-status--empty">未アサイン</span>
            </td>
            <td>
              <NuxtLink v-if="projectCustomerId(item.projectId)" class="management-link" :to="`/customers/${projectCustomerId(item.projectId)}`">{{ projectCustomer(item.projectId) }}</NuxtLink>
              <span v-else>-</span>
            </td>
            <td>{{ item.station || '-' }}</td>
            <td>{{ item.representativeSalesName || '-' }}</td>
            <td>{{ formatDateTime(item.registeredAt) }}</td>
            <td>{{ item.registeredBy }}</td>
            <td>{{ formatDateTime(item.updatedAt) }}</td>
            <td>{{ item.updatedBy }}</td>
          </tr>
          <tr v-if="!loading && visiblePersonnel.length === 0">
            <td class="text-center text-medium-emphasis py-10" colspan="12">要員情報がありません。</td>
          </tr>
        </tbody>
      </v-table>
      <div class="management-pagination">
        <div class="text-body-2 text-medium-emphasis">{{ pageSummary }}</div>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn density="comfortable" icon="mdi-page-first" :disabled="loading || page <= 1" variant="outlined" @click="goToPage(1)" />
          <v-btn density="comfortable" icon="mdi-chevron-left" :disabled="loading || page <= 1" variant="outlined" @click="goToPage(page - 1)" />
          <span class="text-body-2">{{ page }} / {{ lastPage }}</span>
          <v-btn density="comfortable" icon="mdi-chevron-right" :disabled="loading || page >= lastPage" variant="outlined" @click="goToPage(page + 1)" />
          <v-btn density="comfortable" icon="mdi-page-last" :disabled="loading || page >= lastPage" variant="outlined" @click="goToPage(lastPage)" />
          <v-text-field v-model.number="jumpPage" class="page-jump-input" density="compact" hide-details min="1" :max="lastPage" type="number" @keyup.enter="jump" />
          <v-btn color="primary" :disabled="loading" variant="flat" @click="jump">移動</v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

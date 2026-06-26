<script setup lang="ts">
type Project = {
  id: string
  projectName: string
  projectOverview: string
  commercialFlowCode: string
  station: string | null
  beginDate: string
  endDate: string | null
  representativeSalesName: string | null
  customerId: string | null
  assignedPersonnelCount?: number
  registeredAt: string
  updatedAt: string
  registeredBy: string
  updatedBy: string
}
type Customer = { id: string; companyName: string }

type ProjectSearchField = 'projectName' | 'projectOverview' | 'station' | 'representativeSalesName'

type ListResponse = {
  items: Project[]
  total: number
  page: number
  limit: number
  lastPage: number
}
type CustomerListResponse = {
  items: Customer[]
}

const { $api } = useNuxtApp()

definePageMeta({
  layout: 'authenticated'
})

const projects = ref<Project[]>([])
const customers = ref<Customer[]>([])
const loading = ref(true)
const errorMessage = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const lastPage = ref(1)
const jumpPage = ref(1)
const searchField = ref<ProjectSearchField>('projectName')
const keyword = ref('')

const searchFields = [
  { title: '案件名', value: 'projectName' },
  { title: '案件概要', value: 'projectOverview' },
  { title: '最寄駅', value: 'station' },
  { title: '担当営業', value: 'representativeSalesName' }
]

const pageSummary = computed(() => {
  if (total.value === 0) {
    return '0件'
  }

  const from = (page.value - 1) * limit.value + 1
  const to = Math.min(page.value * limit.value, total.value)
  return `${from}～${to}件 / 全${total.value}件`
})

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('ja-JP').format(new Date(value)) : '-'
const formatDateTime = (value: string) => new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(value))
const customerName = (customerId: string | null) =>
  customers.value.find((customer) => customer.id === customerId)?.companyName || customerId || '-'

const fetchCustomers = async () => {
  const { data } = await $api.get<CustomerListResponse>('/customers', {
    params: { page: 1, limit: 100 }
  })
  customers.value = data.items
}

const fetchProjects = async (targetPage = page.value) => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await $api.get<ListResponse>('/projects', {
      params: {
        page: targetPage,
        limit: limit.value,
        searchField: searchField.value,
        keyword: keyword.value
      }
    })

    projects.value = data.items
    total.value = data.total
    page.value = data.page
    lastPage.value = data.lastPage
    jumpPage.value = data.page
  } catch {
    errorMessage.value = '案件情報の取得に失敗しました。再ログインしてください。'
  } finally {
    loading.value = false
  }
}

const search = async () => {
  await fetchProjects(1)
}

const clearSearch = async () => {
  searchField.value = 'projectName'
  keyword.value = ''
  await fetchProjects(1)
}

const goToPage = async (targetPage: number) => {
  await fetchProjects(Math.min(Math.max(Math.trunc(targetPage || 1), 1), lastPage.value))
}

const jump = async () => {
  await goToPage(jumpPage.value)
}

onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchProjects()])
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">案件一覧</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">登録済み案件の基本情報を確認できます。</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/projects/new">新規登録</v-btn>
    </div>

    <v-card class="management-search-card pa-4 mb-5">
      <v-row align="center" dense>
        <v-col cols="12" md="3">
          <v-select v-model="searchField" density="compact" hide-details item-title="title" item-value="value" :items="searchFields" label="検索項目" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="keyword" density="compact" hide-details label="キーワード" prepend-inner-icon="mdi-magnify" @keyup.enter="search" />
        </v-col>
        <v-col class="d-flex ga-2 justify-end" cols="12" md="3">
          <v-btn color="primary" prepend-icon="mdi-magnify" @click="search">検索</v-btn>
          <v-btn prepend-icon="mdi-close" variant="outlined" @click="clearSearch">クリア</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>

    <v-card class="management-table-card">
      <v-progress-linear v-if="loading" color="primary" indeterminate />
      <v-table fixed-header height="calc(100vh - 360px)">
        <thead>
          <tr>
            <th>案件名</th>
            <th>取引先</th>
            <th>概要</th>
            <th>要員</th>
            <th>最寄駅</th>
            <th>期間</th>
            <th>担当営業</th>
            <th>登録日時</th>
            <th>更新日時</th>
            <th>登録者</th>
            <th>更新者</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td class="font-weight-medium">
              <NuxtLink class="management-link" :to="`/projects/${project.id}`">{{ project.projectName }}</NuxtLink>
            </td>
            <td>
              <NuxtLink v-if="project.customerId" class="management-link" :to="`/customers/${project.customerId}`">{{ customerName(project.customerId) }}</NuxtLink>
              <span v-else>-</span>
            </td>
            <td class="wide-cell">{{ project.projectOverview }}</td>
            <td>
              <span
                class="assignment-status"
                :class="(project.assignedPersonnelCount || 0) > 0 ? 'assignment-status--assigned' : 'assignment-status--empty'"
              >
                {{ (project.assignedPersonnelCount || 0) > 0 ? `${project.assignedPersonnelCount}名` : '未アサイン' }}
              </span>
            </td>
            <td>{{ project.station || '-' }}</td>
            <td>{{ formatDate(project.beginDate) }} ～ {{ formatDate(project.endDate) }}</td>
            <td>{{ project.representativeSalesName || '-' }}</td>
            <td>{{ formatDateTime(project.registeredAt) }}</td>
            <td>{{ formatDateTime(project.updatedAt) }}</td>
            <td>{{ project.registeredBy }}</td>
            <td>{{ project.updatedBy }}</td>
          </tr>
          <tr v-if="!loading && projects.length === 0">
            <td class="text-center text-medium-emphasis py-10" colspan="11">案件情報がありません。</td>
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

<script setup lang="ts">
type Customer = {
  id: string
  companyName: string
  representativeName: string | null
  primarySales: string | null
  phoneNumber: string | null
}

type Project = {
  id: string
  projectName: string
  projectOverview: string
  customerId: string | null
  beginDate: string
  endDate: string | null
  representativeSalesName: string | null
  assignedPersonnelCount?: number
}

type Personnel = {
  id: string
  personnelName: string
  personnelNameDisplay: string | null
  skills: string
  station: string | null
  representativeSalesName: string | null
}

type ListResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  lastPage: number
}

const { $api } = useNuxtApp()

definePageMeta({ layout: 'authenticated' })

const customers = ref<Customer[]>([])
const projects = ref<Project[]>([])
const personnel = ref<Personnel[]>([])
const selectedCustomerId = ref('')
const selectedProjectId = ref('')
const loadingCustomers = ref(true)
const loadingProjects = ref(false)
const loadingPersonnel = ref(false)
const errorMessage = ref('')

const selectedCustomer = computed(() =>
  customers.value.find((customer) => customer.id === selectedCustomerId.value) || null
)
const selectedProject = computed(() =>
  projects.value.find((project) => project.id === selectedProjectId.value) || null
)
const customerName = (customerId: string | null | undefined) =>
  customers.value.find((customer) => customer.id === customerId)?.companyName || customerId || '-'
const selectedProjectCustomerName = computed(() =>
  selectedProject.value ? customerName(selectedProject.value.customerId) : selectedCustomer.value?.companyName || '-'
)

const formatDate = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat('ja-JP').format(new Date(value)) : '-'

const fetchPersonnel = async (projectId: string) => {
  loadingPersonnel.value = true
  personnel.value = []

  try {
    const { data } = await $api.get<ListResponse<Personnel>>('/personnel', {
      params: { page: 1, limit: 100, projectId }
    })
    personnel.value = data.items
  } catch {
    errorMessage.value = '要員情報の取得に失敗しました。'
  } finally {
    loadingPersonnel.value = false
  }
}

const selectProject = async (project: Project | null) => {
  selectedProjectId.value = project?.id || ''
  personnel.value = []

  if (project) {
    await fetchPersonnel(project.id)
  }
}

const fetchProjects = async (customerId: string) => {
  loadingProjects.value = true
  projects.value = []
  selectedProjectId.value = ''
  personnel.value = []

  try {
    const { data } = await $api.get<ListResponse<Project>>('/projects', {
      params: { page: 1, limit: 100, customerId }
    })
    projects.value = data.items
    await selectProject(data.items[0] || null)
  } catch {
    errorMessage.value = '案件情報の取得に失敗しました。'
  } finally {
    loadingProjects.value = false
  }
}

const selectCustomer = async (customer: Customer | null) => {
  selectedCustomerId.value = customer?.id || ''
  projects.value = []
  personnel.value = []

  if (customer) {
    await fetchProjects(customer.id)
  }
}

const fetchCustomers = async () => {
  loadingCustomers.value = true
  errorMessage.value = ''

  try {
    const { data } = await $api.get<ListResponse<Customer>>('/customers', {
      params: { page: 1, limit: 100 }
    })
    customers.value = data.items
    await selectCustomer(data.items[0] || null)
  } catch {
    errorMessage.value = '取引先情報の取得に失敗しました。再ログインしてください。'
  } finally {
    loadingCustomers.value = false
  }
}

onMounted(fetchCustomers)
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">ホーム</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">取引先、案件、要員の紐づきを一画面で確認できます。</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn prepend-icon="mdi-office-building-plus-outline" to="/customers/new" variant="outlined">取引先登録</v-btn>
        <v-btn color="primary" prepend-icon="mdi-briefcase-plus-outline" to="/projects/new">案件登録</v-btn>
      </div>
    </div>

    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <div class="relationship-summary mb-5">
      <div class="relationship-metric">
        <div class="relationship-metric__label">選択中の取引先</div>
        <div class="relationship-metric__value relationship-metric__value--text">{{ selectedCustomer?.companyName || '-' }}</div>
      </div>
      <div class="relationship-metric">
        <div class="relationship-metric__label">関連案件</div>
        <div class="relationship-metric__value">{{ projects.length }}</div>
      </div>
      <div class="relationship-metric" :class="personnel.length > 0 ? 'relationship-metric--success' : 'relationship-metric--warning'">
        <div class="relationship-metric__label">選択案件の要員</div>
        <div class="relationship-metric__value">{{ personnel.length }}</div>
      </div>
    </div>

    <v-card class="management-table-card mb-5">
      <div class="home-section-header">
        <div>
          <h2 class="text-subtitle-1 font-weight-bold">取引先一覧</h2>
          <p class="text-caption text-medium-emphasis mb-0">取引先を選択すると案件一覧が切り替わります。</p>
        </div>
        <v-btn density="comfortable" prepend-icon="mdi-format-list-bulleted" to="/customers" variant="text">一覧へ</v-btn>
      </div>
      <v-progress-linear v-if="loadingCustomers" color="primary" indeterminate />
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>企業名</th>
            <th>法人代表</th>
            <th>電話番号</th>
            <th>主担当</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="customer in customers"
            :key="customer.id"
            class="home-selectable-row"
            :class="{ 'home-selectable-row--active': customer.id === selectedCustomerId }"
            @click="selectCustomer(customer)"
          >
            <td class="font-weight-medium"><NuxtLink class="management-link" :to="`/customers/${customer.id}`">{{ customer.companyName }}</NuxtLink></td>
            <td>{{ customer.representativeName || '-' }}</td>
            <td>{{ customer.phoneNumber || '-' }}</td>
            <td>{{ customer.primarySales || '-' }}</td>
          </tr>
          <tr v-if="!loadingCustomers && customers.length === 0">
            <td class="text-center text-medium-emphasis py-6" colspan="4">取引先情報がありません。</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-card class="management-table-card mb-5">
      <div class="home-section-header">
        <div>
          <h2 class="text-subtitle-1 font-weight-bold">案件一覧</h2>
          <p class="text-caption text-medium-emphasis mb-0">{{ selectedCustomer?.companyName || '取引先未選択' }}</p>
        </div>
        <v-btn density="comfortable" prepend-icon="mdi-plus" :to="{ path: '/projects/new', query: selectedCustomerId ? { customerId: selectedCustomerId, returnTo: '/home' } : {} }" variant="text">案件登録</v-btn>
      </div>
      <v-progress-linear v-if="loadingProjects" color="primary" indeterminate />
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>案件名</th>
            <th>取引先</th>
            <th>要員</th>
            <th>概要</th>
            <th>期間</th>
            <th>担当営業</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="project in projects"
            :key="project.id"
            class="home-selectable-row"
            :class="{ 'home-selectable-row--active': project.id === selectedProjectId }"
            @click="selectProject(project)"
          >
            <td class="font-weight-medium"><NuxtLink class="management-link" :to="`/projects/${project.id}`">{{ project.projectName }}</NuxtLink></td>
            <td>{{ customerName(project.customerId) }}</td>
            <td>
              <span class="assignment-status" :class="(project.assignedPersonnelCount || 0) > 0 ? 'assignment-status--assigned' : 'assignment-status--empty'">
                {{ (project.assignedPersonnelCount || 0) > 0 ? `${project.assignedPersonnelCount}名` : '未アサイン' }}
              </span>
            </td>
            <td class="wide-cell">{{ project.projectOverview }}</td>
            <td>{{ formatDate(project.beginDate) }} ～ {{ formatDate(project.endDate) }}</td>
            <td>{{ project.representativeSalesName || '-' }}</td>
          </tr>
          <tr v-if="!loadingProjects && projects.length === 0">
            <td class="text-center text-medium-emphasis py-6" colspan="6">選択中の取引先に紐づく案件はありません。</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-card class="management-table-card">
      <div class="home-section-header">
        <div>
          <h2 class="text-subtitle-1 font-weight-bold">要員一覧</h2>
          <p class="text-caption text-medium-emphasis mb-0">{{ selectedProject?.projectName || '案件未選択' }}</p>
        </div>
        <v-btn density="comfortable" prepend-icon="mdi-account-plus-outline" :to="{ path: '/engineers/new', query: selectedProjectId ? { projectId: selectedProjectId, returnTo: '/home' } : {} }" variant="text">要員登録</v-btn>
      </div>
      <v-progress-linear v-if="loadingPersonnel" color="primary" indeterminate />
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>要員名</th>
            <th>担当案件</th>
            <th>取引先</th>
            <th>表示名</th>
            <th>スキル</th>
            <th>最寄駅</th>
            <th>担当営業</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in personnel" :key="person.id">
            <td class="font-weight-medium"><NuxtLink class="management-link" :to="`/engineers/${person.id}`">{{ person.personnelName }}</NuxtLink></td>
            <td>
              <NuxtLink v-if="selectedProject" class="management-link" :to="`/projects/${selectedProject.id}`">{{ selectedProject.projectName }}</NuxtLink>
              <span v-else>-</span>
            </td>
            <td>{{ selectedProjectCustomerName }}</td>
            <td>{{ person.personnelNameDisplay || '-' }}</td>
            <td class="wide-cell">{{ person.skills }}</td>
            <td>{{ person.station || '-' }}</td>
            <td>{{ person.representativeSalesName || '-' }}</td>
          </tr>
          <tr v-if="!loadingPersonnel && personnel.length === 0">
            <td class="text-center text-medium-emphasis py-6" colspan="7">選択中の案件にアサインされた要員はありません。</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
type Personnel = {
  id: string
  personnelName: string
  personnelNameDisplay: string | null
  skills: string
  projectId: string | null
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
const route = useRoute()
const router = useRouter()

definePageMeta({ layout: 'authenticated' })

const personnel = ref<Personnel[]>([])
const selectedPersonnelId = ref('')
const loading = ref(true)
const errorMessage = ref('')

const selectedPersonnel = computed(() =>
  personnel.value.find((person) => person.id === selectedPersonnelId.value) || null
)

const selectPersonnel = (person: Personnel) => {
  selectedPersonnelId.value = person.id
  router.replace({ query: { ...route.query, personnelId: person.id } })
}

const fetchPersonnel = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await $api.get<ListResponse<Personnel>>('/personnel', {
      params: { page: 1, limit: 100 }
    })
    personnel.value = data.items
    const queryPersonnelId = typeof route.query.personnelId === 'string' ? route.query.personnelId : ''
    const matchedPersonnel = data.items.find((person) => person.id === queryPersonnelId)
    selectedPersonnelId.value = matchedPersonnel?.id || data.items[0]?.id || ''
  } catch {
    errorMessage.value = '要員情報の取得に失敗しました。'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPersonnel)

watch(() => route.query.personnelId, (personnelId) => {
  if (typeof personnelId !== 'string') return
  if (personnel.value.some((person) => person.id === personnelId)) {
    selectedPersonnelId.value = personnelId
  }
})
</script>

<template>
  <div class="management-page">
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">経歴書管理</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">要員を選択して、経歴書の登録・プレビュー・ダウンロードを行えます。</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-account-plus-outline" to="/engineers/new">要員登録</v-btn>
    </div>

    <v-alert v-if="errorMessage" class="mb-5" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <v-row dense>
      <v-col cols="12" md="4">
        <v-card class="management-table-card">
          <div class="home-section-header">
            <div>
              <h2 class="text-subtitle-1 font-weight-bold">要員一覧</h2>
              <p class="text-caption text-medium-emphasis mb-0">管理対象の要員を選択してください。</p>
            </div>
          </div>
          <v-progress-linear v-if="loading" color="primary" indeterminate />
          <v-table density="comfortable">
            <thead>
              <tr>
                <th>要員名</th>
                <th>担当営業</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="person in personnel"
                :key="person.id"
                class="home-selectable-row"
                :class="{ 'home-selectable-row--active': person.id === selectedPersonnelId }"
                @click="selectPersonnel(person)"
              >
                <td class="font-weight-medium">
                  <NuxtLink class="management-link" :to="`/engineers/${person.id}`">{{ person.personnelName }}</NuxtLink>
                  <div v-if="person.personnelNameDisplay" class="text-caption text-medium-emphasis">{{ person.personnelNameDisplay }}</div>
                </td>
                <td>{{ person.representativeSalesName || '-' }}</td>
              </tr>
              <tr v-if="!loading && personnel.length === 0">
                <td class="text-center text-medium-emphasis py-6" colspan="2">要員情報がありません。</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="management-detail-card pa-5 pa-md-6">
          <template v-if="selectedPersonnel">
            <div class="relationship-summary mb-5">
              <div class="relationship-metric">
                <div class="relationship-metric__label">選択中の要員</div>
                <div class="relationship-metric__value relationship-metric__value--text">{{ selectedPersonnel.personnelName }}</div>
              </div>
              <div class="relationship-metric" :class="selectedPersonnel.projectId ? 'relationship-metric--success' : 'relationship-metric--warning'">
                <div class="relationship-metric__label">案件アサイン</div>
                <div class="relationship-metric__value relationship-metric__value--text">{{ selectedPersonnel.projectId ? 'アサイン済' : '未アサイン' }}</div>
              </div>
            </div>
            <ResumeManager :personnel-id="selectedPersonnel.id" />
          </template>
          <div v-else class="text-center text-medium-emphasis py-10">要員を選択してください。</div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

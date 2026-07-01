<script setup lang="ts">
type Resume = {
  id: string
  engineerId: string
  title: string
  version: number
  fileName: string | null
  contentType: string | null
  fileSize: number
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  personnelId: string
}>()

const { $api } = useNuxtApp()

const resumes = ref<Resume[]>([])
const filePicker = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const title = ref('')
const loading = ref(false)
const uploading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const sortKey = ref('createdAt')
const sortDirection = ref<'asc' | 'desc'>('desc')
const columnFilters = reactive<Record<string, string>>({})

const selectedFileName = computed(() => selectedFile.value?.name || '')

const resumeColumnValue = (resume: Resume, column: string) => {
  switch (column) {
    case 'title': return resume.title
    case 'fileName': return resume.fileName || ''
    case 'contentType': return resume.contentType || ''
    case 'fileSize': return String(resume.fileSize || 0)
    case 'createdAt': return resume.createdAt
    default: return ''
  }
}

const compareValues = (left: string, right: string) => left.localeCompare(right, 'ja', {
  numeric: true,
  sensitivity: 'base'
})

const visibleResumes = computed(() => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value)
  return [...resumes.value]
    .filter((resume) => activeFilters.every(([column, value]) =>
      resumeColumnValue(resume, column).toLowerCase().includes(value.toLowerCase())
    ))
    .sort((left, right) => {
      const result = compareValues(resumeColumnValue(left, sortKey.value), resumeColumnValue(right, sortKey.value))
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

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.item(0) || null
  selectedFile.value = file
  if (file && !title.value) {
    title.value = file.name
  }
}

const formatDateTime = (value: string) => new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(value))

const formatFileSize = (value: number) => {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
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

const fetchResumes = async () => {
  if (!props.personnelId) return

  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await $api.get<Resume[]>(`/personnel/${props.personnelId}/resumes`)
    resumes.value = data
  } catch {
    errorMessage.value = '経歴書情報の取得に失敗しました。'
  } finally {
    loading.value = false
  }
}

const uploadResume = async () => {
  const uploadFile = selectedFile.value
  if (!uploadFile) {
    errorMessage.value = 'アップロードする経歴書ファイルを選択してください。'
    return
  }
  selectedFile.value = uploadFile

  uploading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $api.post(`/personnel/${props.personnelId}/resumes`, {
      title: title.value || uploadFile.name,
      fileName: uploadFile.name,
      contentType: uploadFile.type || 'application/octet-stream',
      contentBase64: await toBase64(uploadFile)
    })
    selectedFile.value = null
    if (filePicker.value) {
      filePicker.value.value = ''
    }
    title.value = ''
    successMessage.value = '経歴書を登録しました。'
    await fetchResumes()
  } catch {
    errorMessage.value = '経歴書の登録に失敗しました。PDF、Word、Excelのファイルを確認してください。'
  } finally {
    uploading.value = false
  }
}

const openBlob = (blob: Blob, fileName: string, download: boolean) => {
  const url = URL.createObjectURL(blob)
  if (download) {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

const previewResume = async (resume: Resume) => {
  const { data } = await $api.get<Blob>(`/personnel/${props.personnelId}/resumes/${resume.id}/preview`, {
    responseType: 'blob'
  })
  openBlob(data, resume.fileName || resume.title, false)
}

const downloadResume = async (resume: Resume) => {
  const { data } = await $api.get<Blob>(`/personnel/${props.personnelId}/resumes/${resume.id}/download`, {
    responseType: 'blob'
  })
  openBlob(data, resume.fileName || resume.title, true)
}

const deleteResume = async (resume: Resume) => {
  if (!window.confirm(`経歴書「${resume.title}」を削除します。よろしいですか？`)) return

  errorMessage.value = ''
  successMessage.value = ''
  try {
    await $api.delete(`/personnel/${props.personnelId}/resumes/${resume.id}`)
    successMessage.value = '経歴書を削除しました。'
    await fetchResumes()
  } catch {
    errorMessage.value = '経歴書の削除に失敗しました。'
  }
}

watch(() => props.personnelId, fetchResumes)
onMounted(fetchResumes)
</script>

<template>
  <div class="resume-manager">
    <div class="d-flex align-center justify-space-between mb-3">
      <div>
        <h2 class="text-subtitle-1 font-weight-bold">経歴書管理</h2>
        <p class="text-caption text-medium-emphasis mb-0">PDF、Word、Excel形式の経歴書を複数登録できます。</p>
      </div>
    </div>

    <v-alert v-if="successMessage" class="mb-4" density="comfortable" type="success" variant="tonal">{{ successMessage }}</v-alert>
    <v-alert v-if="errorMessage" class="mb-4" density="comfortable" type="error" variant="tonal">{{ errorMessage }}</v-alert>

    <v-row align="center" class="mb-3" dense>
      <v-col cols="12" md="4">
        <v-text-field v-model="title" density="compact" hide-details label="タイトル" />
      </v-col>
      <v-col cols="12" md="5">
        <label class="resume-file-field">
          <span class="resume-file-field__label">経歴書ファイル</span>
          <span class="resume-file-field__body">
            <v-icon icon="mdi-paperclip" size="18" />
            <span class="resume-file-field__name">{{ selectedFileName || 'ファイルを選択' }}</span>
            <v-icon icon="mdi-folder-open-outline" size="20" />
          </span>
          <input
            ref="filePicker"
            accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            class="resume-file-field__input"
            type="file"
            @change="handleFileChange"
          />
        </label>
      </v-col>
      <v-col class="d-flex justify-end" cols="12" md="3">
        <v-btn color="primary" prepend-icon="mdi-upload-outline" :loading="uploading" @click="uploadResume">アップロード</v-btn>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" class="mb-3" color="primary" indeterminate />
    <v-table density="comfortable">
      <thead>
        <tr>
          <th><ListHeaderCell column="title" filterable label="タイトル" :filter-value="columnFilters.title" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          <th><ListHeaderCell column="fileName" filterable label="ファイル名" :filter-value="columnFilters.fileName" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          <th><ListHeaderCell column="contentType" filterable label="形式" :filter-value="columnFilters.contentType" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          <th><ListHeaderCell column="fileSize" label="サイズ" :filterable="false" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          <th><ListHeaderCell column="createdAt" label="登録日時" :filterable="false" :sort-direction="sortDirection" :sort-key="sortKey" @filter="filterBy" @sort="sortBy" /></th>
          <th><ListHeaderCell label="操作" :filterable="false" :sortable="false" /></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="resume in visibleResumes" :key="resume.id">
          <td class="font-weight-medium">{{ resume.title }}</td>
          <td>{{ resume.fileName || '-' }}</td>
          <td>{{ resume.contentType || '-' }}</td>
          <td>{{ formatFileSize(resume.fileSize) }}</td>
          <td>{{ formatDateTime(resume.createdAt) }}</td>
          <td>
            <div class="d-flex ga-1">
              <v-btn density="comfortable" icon="mdi-eye-outline" variant="text" @click="previewResume(resume)" />
              <v-btn density="comfortable" icon="mdi-download-outline" variant="text" @click="downloadResume(resume)" />
              <v-btn color="error" density="comfortable" icon="mdi-delete-outline" variant="text" @click="deleteResume(resume)" />
            </div>
          </td>
        </tr>
        <tr v-if="!loading && visibleResumes.length === 0">
          <td class="text-center text-medium-emphasis py-6" colspan="6">登録済みの経歴書はありません。</td>
        </tr>
      </tbody>
    </v-table>
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

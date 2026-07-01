<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  column?: string
  sortable?: boolean
  filterable?: boolean
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  filterValue?: string
}>(), {
  column: '',
  sortable: true,
  filterable: false,
  sortKey: '',
  sortDirection: 'asc',
  filterValue: ''
})

const emit = defineEmits<{
  sort: [column: string]
  filter: [column: string, value: string]
}>()

const root = ref<HTMLElement | null>(null)
const draft = ref(props.filterValue)
const filterOpen = ref(false)

const isSorted = computed(() => props.column && props.sortKey === props.column)

const applyFilter = () => {
  if (!props.column) return
  emit('filter', props.column, draft.value.trim())
  filterOpen.value = false
}

const clearFilter = () => {
  draft.value = ''
  if (!props.column) return
  emit('filter', props.column, '')
}

const toggleFilter = () => {
  filterOpen.value = !filterOpen.value
}

const closeFilterOnOutsideClick = (event: MouseEvent) => {
  if (!filterOpen.value) return
  if (root.value?.contains(event.target as Node)) return
  filterOpen.value = false
}

watch(() => props.filterValue, (value) => {
  draft.value = value
})

watch(draft, (value) => {
  if (value === '' && props.filterValue) {
    clearFilter()
  }
})

onMounted(() => {
  document.addEventListener('click', closeFilterOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeFilterOnOutsideClick)
})
</script>

<template>
  <div ref="root" class="list-header-cell">
    <div class="list-header-cell__toolbar">
      <button
        class="list-header-cell__sort"
        :class="{ 'list-header-cell__sort--active': isSorted }"
        type="button"
        @click="column && sortable && emit('sort', column)"
      >
        <span>{{ label }}</span>
        <span v-if="sortable && column" class="list-header-cell__sort-indicator" aria-hidden="true">
          <span
            class="list-header-cell__sort-triangle list-header-cell__sort-triangle--asc"
            :class="{ 'list-header-cell__sort-triangle--active': isSorted && sortDirection === 'asc' }"
          />
          <span
            class="list-header-cell__sort-triangle list-header-cell__sort-triangle--desc"
            :class="{ 'list-header-cell__sort-triangle--active': isSorted && sortDirection === 'desc' }"
          />
        </span>
      </button>
      <button
        v-if="filterable && column"
        class="list-header-cell__filter-toggle"
        :class="{ 'list-header-cell__filter-toggle--active': filterOpen || !!filterValue }"
        type="button"
        aria-label="フィルター"
        @click.stop="toggleFilter"
      >
        <span class="list-header-cell__funnel" aria-hidden="true" />
      </button>
    </div>
    <v-text-field
      v-if="filterable && column && filterOpen"
      v-model="draft"
      class="list-header-cell__filter"
      clearable
      density="compact"
      hide-details
      placeholder="検索"
      variant="outlined"
      @click:clear="clearFilter"
      @keyup.enter="applyFilter"
      @click.stop
    />
  </div>
</template>

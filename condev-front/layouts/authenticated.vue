<script setup lang="ts">
type AuthUser = {
  id: string
  companyName: string
  userName: string
  email: string
}

type AppInfo = {
  databaseName: string
  systemVersion: string
}

const { $api } = useNuxtApp()
const route = useRoute()

const user = ref<AuthUser | null>(null)
const appInfo = ref<AppInfo>({
  databaseName: '-',
  systemVersion: '-'
})

const menuItems = [
  { title: 'ホーム', icon: 'mdi-home-outline', to: '/home' },
  { title: '取引先管理', icon: 'mdi-office-building-outline', to: '/customers' },
  { title: '営業管理', icon: 'mdi-handshake-outline', to: '/sales' },
  { title: '案件管理', icon: 'mdi-briefcase-outline', to: '/projects' },
  { title: '要員管理', icon: 'mdi-account-group-outline', to: '/engineers' },
  { title: '経歴書管理', icon: 'mdi-file-account-outline', to: '/resumes' },
  { title: 'スキル管理', icon: 'mdi-star-outline', to: '/skills' },
  { title: '見積もり管理', icon: 'mdi-file-document-edit-outline', to: '/estimates' },
  { title: '契約管理', icon: 'mdi-file-sign-outline', to: '/contracts' }
]

const currentMenuTitle = computed(() => {
  return menuItems.find((item) => item.to === route.path)?.title || '業務管理'
})

const goTo = async (path: string) => {
  await navigateTo(path)
}

const logout = async () => {
  localStorage.removeItem('accessToken')
  await navigateTo('/login')
}

onMounted(async () => {
  if (!localStorage.getItem('accessToken')) {
    await navigateTo('/login')
    return
  }

  try {
    const [profileResponse, appInfoResponse] = await Promise.all([
      $api.get<AuthUser>('/auth/me'),
      $api.get<AppInfo>('/app-info')
    ])
    user.value = profileResponse.data
    appInfo.value = appInfoResponse.data
  } catch {
    localStorage.removeItem('accessToken')
    await navigateTo('/login')
  }
})
</script>

<template>
  <v-layout class="app-shell">
    <v-app-bar class="app-header" density="comfortable" flat>
      <v-app-bar-title>
        <div class="app-brand">
          <span class="app-brand__logo-wrap">
            <img class="app-brand__logo" src="/images/snssoft-logo.svg" alt="株式会社SNSソフト" />
          </span>
          <span class="app-brand__title">SES受託開発業務管理</span>
        </div>
      </v-app-bar-title>
      <v-spacer />

      <v-btn class="mr-2" prepend-icon="mdi-home-outline" to="/home" variant="text">
        ホーム
      </v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn v-bind="props" append-icon="mdi-chevron-down" prepend-icon="mdi-view-grid-outline" variant="text">
            メニュー
          </v-btn>
        </template>

        <v-list class="app-menu" density="comfortable" min-width="230">
          <v-list-item
            v-for="item in menuItems"
            :key="item.to"
            :active="route.path === item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            @click="goTo(item.to)"
          />
          <v-divider class="my-1" />
          <v-list-item
            base-color="error"
            prepend-icon="mdi-logout"
            title="ログアウト"
            @click="logout"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="app-main">
      <v-container class="py-8" fluid>
        <slot />
      </v-container>
    </v-main>

    <v-footer app border class="app-footer">
      <div class="app-footer__left">
        <span class="app-footer__logo-wrap">
          <img class="app-footer__logo" src="/images/snssoft-logo.svg" alt="株式会社SNSソフト" />
        </span>
        <span class="app-footer__text text-caption">
          {{ appInfo.databaseName }}：{{ appInfo.systemVersion }}
        </span>
      </div>
      <v-spacer />
      <div class="app-footer__text text-caption">
        {{ user?.userName || '-' }}
      </div>
    </v-footer>
  </v-layout>
</template>

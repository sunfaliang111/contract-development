<script setup lang="ts">
const { $api } = useNuxtApp()

const form = reactive({
  email: '',
  password: '',
  rememberMe: true
})

const visible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as {
    response?: { data?: { message?: string | string[] } }
  }).response?.data?.message

  if (Array.isArray(responseMessage)) {
    return responseMessage.join('\n')
  }

  return responseMessage || fallback
}

const emailRules = [
  (value: string) => !!value || 'メールアドレスを入力してください',
  (value: string) => /.+@.+\..+/.test(value) || 'メールアドレスの形式で入力してください'
]

const passwordRules = [
  (value: string) => !!value || 'パスワードを入力してください',
  (value: string) => value.length >= 8 || '8文字以上で入力してください'
]

const submit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const { data } = await $api.post('/auth/login', form)
    if (process.client) {
      localStorage.setItem('accessToken', data.accessToken)
    }
    await navigateTo('/customers')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      'ログインに失敗しました。入力内容を確認してください。'
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-layout class="auth-shell">
    <v-main>
      <v-row no-gutters>
        <v-col class="d-none d-lg-flex auth-side align-center justify-center" cols="5">
          <div class="auth-side__content px-10">
            <div class="auth-side__logo-wrap mb-8">
              <img alt="SNS SOFT" class="auth-side__logo" src="/images/snssoft-logo.svg">
            </div>
            <div class="text-h3 font-weight-bold mb-6">SES業務管理</div>
            <p class="text-body-1 mb-10">
              取引先、案件、契約、請求までを一元管理するための社内業務基盤です。
            </p>
            <div class="d-flex flex-column ga-6">
              <div class="status-item">
                <div class="text-subtitle-1 font-weight-bold">取引先情報</div>
                <div class="text-body-2 opacity-80">企業、担当者、契約窓口を整理</div>
              </div>
              <div class="status-item">
                <div class="text-subtitle-1 font-weight-bold">受託開発</div>
                <div class="text-body-2 opacity-80">商談から進行中案件まで追跡</div>
              </div>
            </div>
          </div>
        </v-col>

        <v-col class="d-flex align-center justify-center pa-6 pa-md-10" cols="12" lg="7">
          <div class="auth-panel">
            <div class="mb-8">
              <div class="auth-form-logo-wrap mb-5">
                <img alt="SNS SOFT" class="auth-form-logo" src="/images/snssoft-logo.svg">
              </div>
              <h1 class="text-h4 font-weight-bold mb-2">ログイン</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                アカウント情報を入力して管理画面に進んでください。
              </p>
            </div>

            <v-card class="auth-card pa-6 pa-md-8">
              <v-alert
                v-if="errorMessage"
                class="mb-5"
                density="comfortable"
                type="error"
                variant="tonal"
              >
                {{ errorMessage }}
              </v-alert>

              <v-form @submit.prevent="submit">
                <v-text-field
                  v-model="form.email"
                  autocomplete="email"
                  class="mb-4"
                  label="メールアドレス"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="emailRules"
                  type="email"
                />

                <v-text-field
                  v-model="form.password"
                  autocomplete="current-password"
                  class="mb-2"
                  label="パスワード"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :rules="passwordRules"
                  :type="visible ? 'text' : 'password'"
                  @click:append-inner="visible = !visible"
                />

                <div class="d-flex align-center justify-space-between mb-6">
                  <v-checkbox
                    v-model="form.rememberMe"
                    color="secondary"
                    density="compact"
                    hide-details
                    label="ログイン状態を保持"
                  />
                  <v-btn color="primary" variant="text">再設定</v-btn>
                </div>

                <v-btn
                  block
                  color="primary"
                  :loading="loading"
                  size="large"
                  type="submit"
                >
                  ログイン
                </v-btn>
              </v-form>

              <v-divider class="my-6" />

              <div class="text-center text-body-2">
                アカウントをお持ちでない場合
                <NuxtLink class="text-primary font-weight-bold" to="/register">新規登録</NuxtLink>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </v-layout>
</template>

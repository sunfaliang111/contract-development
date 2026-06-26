<script setup lang="ts">
const { $api } = useNuxtApp()

const form = reactive({
  companyName: '',
  userName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const visible = ref(false)
const confirmVisible = ref(false)
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

const requiredRule = (label: string) => (value: string) => !!value || `${label}を入力してください`
const emailRules = [
  requiredRule('メールアドレス'),
  (value: string) => /.+@.+\..+/.test(value) || 'メールアドレスの形式で入力してください'
]
const passwordRules = [
  requiredRule('パスワード'),
  (value: string) => value.length >= 8 || '8文字以上で入力してください'
]
const confirmRules = [
  requiredRule('確認用パスワード'),
  (value: string) => value === form.password || 'パスワードが一致しません'
]
const termsRules = [
  (value: boolean) => value || '利用規約への同意が必要です'
]

const submit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await $api.post('/auth/register', form)
    await navigateTo('/login')
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      '登録に失敗しました。入力内容を確認してください。'
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
            <div class="text-h3 font-weight-bold mb-6">取引先管理を始める</div>
            <p class="text-body-1 mb-10">
              SES受託開発の取引先接点を、担当者ごとの記憶ではなくチームの資産として残します。
            </p>
            <div class="d-flex flex-column ga-6">
              <div class="status-item">
                <div class="text-subtitle-1 font-weight-bold">会社情報</div>
                <div class="text-body-2 opacity-80">取引先企業の基本属性を管理</div>
              </div>
              <div class="status-item">
                <div class="text-subtitle-1 font-weight-bold">担当者情報</div>
                <div class="text-body-2 opacity-80">部署、役職、連絡先を紐付け</div>
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
              <h1 class="text-h4 font-weight-bold mb-2">新規登録</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                初回管理者アカウントを作成してください。
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
                  v-model="form.companyName"
                  class="mb-4"
                  label="会社名"
                  prepend-inner-icon="mdi-office-building-outline"
                  :rules="[requiredRule('会社名')]"
                />

                <v-text-field
                  v-model="form.userName"
                  class="mb-4"
                  label="氏名"
                  prepend-inner-icon="mdi-account-outline"
                  :rules="[requiredRule('氏名')]"
                />

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
                  autocomplete="new-password"
                  class="mb-4"
                  label="パスワード"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :rules="passwordRules"
                  :type="visible ? 'text' : 'password'"
                  @click:append-inner="visible = !visible"
                />

                <v-text-field
                  v-model="form.confirmPassword"
                  autocomplete="new-password"
                  class="mb-2"
                  label="パスワード確認"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :append-inner-icon="confirmVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  :rules="confirmRules"
                  :type="confirmVisible ? 'text' : 'password'"
                  @click:append-inner="confirmVisible = !confirmVisible"
                />

                <v-checkbox
                  v-model="form.agreeTerms"
                  class="mb-4"
                  color="secondary"
                  density="comfortable"
                  label="利用規約と個人情報の取扱いに同意します"
                  :rules="termsRules"
                />

                <v-btn
                  block
                  color="primary"
                  :loading="loading"
                  size="large"
                  type="submit"
                >
                  登録
                </v-btn>
              </v-form>

              <v-divider class="my-6" />

              <div class="text-center text-body-2">
                すでにアカウントをお持ちの場合
                <NuxtLink class="text-primary font-weight-bold" to="/login">ログイン</NuxtLink>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </v-layout>
</template>

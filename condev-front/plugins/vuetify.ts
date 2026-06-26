import { createVuetify } from 'vuetify'
import {
  VAlert,
  VApp,
  VAppBar,
  VAppBarTitle,
  VBtn,
  VCard,
  VCheckbox,
  VCol,
  VContainer,
  VDivider,
  VFooter,
  VForm,
  VLayout,
  VList,
  VListItem,
  VMain,
  VMenu,
  VProgressLinear,
  VRow,
  VSelect,
  VSpacer,
  VTable,
  VTextField,
  VTextarea
} from 'vuetify/components'
import { Ripple } from 'vuetify/directives'

const components = {
  VAlert,
  VApp,
  VAppBar,
  VAppBarTitle,
  VBtn,
  VCard,
  VCheckbox,
  VCol,
  VContainer,
  VDivider,
  VFooter,
  VForm,
  VLayout,
  VList,
  VListItem,
  VMain,
  VMenu,
  VProgressLinear,
  VRow,
  VSelect,
  VSpacer,
  VTable,
  VTextField,
  VTextarea
}

const directives = {
  Ripple
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    defaults: {
      VBtn: {
        rounded: 'sm'
      },
      VCard: {
        rounded: 'sm'
      },
      VTextField: {
        color: 'primary',
        variant: 'outlined'
      }
    },
    theme: {
      defaultTheme: 'sesLight',
      themes: {
        sesLight: {
          dark: false,
          colors: {
            primary: '#009b77',
            secondary: '#249464',
            accent: '#d58b28',
            error: '#c2413f',
            info: '#346fb7',
            success: '#249464',
            warning: '#d58b28',
            background: '#f7f8fb',
            surface: '#ffffff'
          }
        }
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})

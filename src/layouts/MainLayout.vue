<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          MyChat
        </q-toolbar-title>

        <q-btn flat round icon="person">
          <q-menu>
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup>
                <q-item-section>Профиль</q-item-section>
              </q-item>
              <q-item clickable v-close-popup class="text-negative">
                <q-item-section>Выйти</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onErrorCaptured } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const toggleDarkMode = () => {
  $q.dark.toggle()
}

onErrorCaptured((err) => {
  console.error('Layout error:', err)
  return false
})
</script>

<style lang="scss" scoped>
.main-layout {
  background: var(--darkreader-bg--q-dark);
  min-height: 100vh;
  color: var(--darkreader-text--q-dark);

  :deep(.q-page-container) {
    height: calc(100vh - 50px);
    background: var(--darkreader-bg--q-dark);
  }

  :deep(.q-header) {
    background: var(--darkreader-bg--q-dark) !important;
  }

  :deep(.q-toolbar) {
    background: var(--darkreader-bg--q-dark);
  }

  :deep(.q-menu) {
    background: var(--darkreader-bg--q-dark);
    color: var(--darkreader-text--q-dark);

    .q-item {
      color: var(--darkreader-text--q-dark);
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

:deep(.body--dark) {
  .main-layout {
    background: var(--darkreader-bg--q-dark);
  }
}
</style>

<template>
  <q-page class="chat-page q-pa-none">
    <ChatComponent />
  </q-page>
</template>

<script setup>
import ChatComponent from 'components/ChatComponent.vue'
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100%;
  background: var(--q-dark-page);
  color: white;
}
</style> 
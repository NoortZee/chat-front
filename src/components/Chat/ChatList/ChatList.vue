<template>
  <div class="chat-list">
    <q-list separator>
      <q-item
        v-for="chat in chats"
        :key="chat.id"
        clickable
        v-ripple
        :active="selectedChatId === chat.id"
        @click="$emit('select-chat', chat.id)"
        @contextmenu.prevent="showContextMenu($event, chat)"
        class="chat-item q-py-sm"
      >
        <q-item-section avatar>
          <q-avatar>
            <img :src="chat.avatar || 'https://cdn.quasar.dev/img/avatar.png'">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold">{{ chat.name }}</q-item-label>
          <q-item-label caption lines="1">
            {{ chat.lastMessage }} 
          </q-item-label>
        </q-item-section>

 
        <div class="text-grey-6 text-caption">
          <q-badge
            v-if="chat.unreadCount"
            color="primary"
            floating
            class="q-mt-sm q-mr-sm"
          >
            {{ chat.unreadCount }}
          </q-badge>
        </div>
        <div class="text-caption q-mt-auto">{{ chat.lastMessageTime }}</div>

        <!-- Контекстное меню -->
        <q-menu
          v-model="chat.showMenu"
          context-menu
        >
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click="archiveChat(chat)">
              <q-item-section>
                <q-item-label>
                  <q-icon name="archive" size="xs" class="q-mr-sm" />
                  Архивировать
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="deleteChat(chat)" class="text-negative">
              <q-item-section>
                <q-item-label>
                  <q-icon name="delete" size="xs" class="q-mr-sm" />
                  Удалить
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  chats: {
    type: Array,
    required: true
  },
  selectedChatId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['select-chat', 'archive-chat', 'delete-chat'])

const showContextMenu = (event, chat) => {
  // Устанавливаем showMenu для конкретного чата
  chat.showMenu = true
}

const archiveChat = (chat) => {
  if (chat) {
    emit('archive-chat', chat.id)
  }
}

const deleteChat = (chat) => {
  if (chat) {
    emit('delete-chat', chat.id)
  }
}
</script>

<style lang="scss" scoped>
.chat-list {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background: var(--darkreader-bg--q-dark);
  color: var(--darkreader-text--q-dark);

  :deep(.q-item) {
    color: var(--darkreader-text--q-dark);
    padding: 10px 16px;
  }

  :deep(.q-item.q-item--active) {
    background: var(--active-bg);
  }

  :deep(.q-item__label--caption) {
    color: var(--secondary-text);
  }

  :deep(.q-separator) {
    background: var(--divider-color);
  }
}

.chat-item {
  &.q-item--active {
    background: var(--active-bg);
  }
  
  &:hover {
    background: var(--hover-bg);
  }
}

:deep(.q-menu) {
  background: var(--darkreader-bg--q-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  .q-item {
    &:hover {
      background: var(--hover-bg);
    }
  }
}
</style> 
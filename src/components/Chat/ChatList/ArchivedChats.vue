<template>
  <div class="archived-chats">
    <q-item
      clickable
      v-ripple
      @click="isExpanded = !isExpanded"
      @contextmenu.prevent="showArchiveMenu"
      class="archive-header q-py-sm"
    >
      <q-item-section avatar>
        <q-icon name="archive" size="24px" color="grey" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-medium">Архив</q-item-label>
        <q-item-label caption>{{ archivedChats.length }} чатов</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon
          :name="isExpanded ? 'expand_less' : 'expand_more'"
          size="24px"
          color="grey"
        />
      </q-item-section>

      <q-menu v-model="showMenu" context-menu>
        <q-list style="min-width: 150px">
          <q-item clickable v-close-popup @click="unarchiveAll">
            <q-item-section>
              <q-item-label>
                <q-icon name="unarchive" size="xs" class="q-mr-sm" />
                Разархивировать все
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-item>

    <q-slide-transition>
      <div v-show="isExpanded">
        <q-list separator>
          <q-item
            v-for="chat in archivedChats"
            :key="chat.id"
            clickable
            v-ripple
            :active="selectedChatId === chat.id"
            @click="$emit('select-chat', chat.id)"
            @contextmenu.prevent="showContextMenu($event, chat)"
            class="chat-item q-py-sm archived-chat-item"
          >
            <q-item-section avatar>
              <q-avatar>
                <img :src="chat.avatar || 'https://cdn.quasar.dev/img/avatar.png'">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ chat.name }}</q-item-label>
              <q-item-label caption lines="1" class="row items-center">
                <q-icon name="archive" size="14px" class="q-mr-xs" />
                {{ chat.lastMessage }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="column items-end">
                <div class="text-caption q-mb-xs">{{ chat.lastMessageTime }}</div>
                <q-badge
                  v-if="chat.unreadCount"
                  color="primary"
                  rounded
                >
                  {{ chat.unreadCount }}
                </q-badge>
              </div>
            </q-item-section>

            <q-menu
              v-model="chat.showMenu"
              context-menu
            >
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="unarchiveChat(chat)">
                  <q-item-section>
                    <q-item-label>
                      <q-icon name="unarchive" size="xs" class="q-mr-sm" />
                      Разархивировать
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
    </q-slide-transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  archivedChats: {
    type: Array,
    required: true
  },
  selectedChatId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['select-chat', 'unarchive-chat', 'delete-chat', 'unarchive-all'])
const isExpanded = ref(false)
const showMenu = ref(false)

const showArchiveMenu = (event) => {
  showMenu.value = true
}

const showContextMenu = (event, chat) => {
  chat.showMenu = true
}

const unarchiveChat = (chat) => {
  if (chat) {
    emit('unarchive-chat', chat.id)
  }
}

const unarchiveAll = () => {
  emit('unarchive-all')
}

const deleteChat = (chat) => {
  if (chat) {
    emit('delete-chat', chat.id)
  }
}
</script>

<style lang="scss" scoped>
.archived-chats {
  border-bottom: 1px solid var(--divider-color);
}

.archive-header {
  background: var(--darkreader-bg--q-dark);
  opacity: 0.8;

  &:hover {
    background: var(--hover-bg);
  }
}

.archived-chat-item {
  padding-left: 16px;
  background: rgba(var(--q-primary-rgb), 0.03);
}

.chat-item {
  &.q-item--active {
    background: var(--active-bg);
  }
  
  &:hover {
    background: var(--hover-bg);
  }

  :deep(.q-item__section--side) {
    padding-right: 0;
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

:deep(.q-badge) {
  font-size: 11px;
  padding: 2px 6px;
}
</style> 
<template>
  <div class="message-container">
    <q-avatar v-if="!isOwn" size="28px" class="message-avatar">
      <img :src="avatar || 'https://cdn.quasar.dev/img/avatar.png'" />
    </q-avatar>
    <div
      class="message-bubble q-pa-sm"
      :class="{
        'message-bubble--own': isOwn,
        'message-bubble--other': !isOwn
      }"
      @contextmenu.prevent="showContextMenu"
    >
      <div class="message-wrapper">
        <div v-if="!isOwn" class="text-caption text-weight-bold q-mb-xs">{{ username }}</div>
        <div class="message-content">
          <div class="message-text">{{ text }}</div>
          <div class="message-meta">
            <span class="message-time text-caption text-grey-7">{{ time }}</span>
            <q-icon
              v-if="isOwn"
              :name="statusIcon"
              :color="statusColor"
              size="16px"
              class="q-ml-xs"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Контекстное меню для сообщений -->
    <q-menu
      v-model="showMenu"
      context-menu
    >
      <q-list style="min-width: 180px">
        <q-item v-if="isOwn" clickable v-close-popup @click="$emit('edit-message')">
          <q-item-section>
            <q-item-label>
              <q-icon name="edit" size="xs" class="q-mr-sm" />
              Редактировать
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="showDeleteOptions = true">
          <q-item-section>
            <q-item-label class="text-negative">
              <q-icon name="delete" size="xs" class="q-mr-sm" />
              Удалить
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <!-- Подменю для опций удаления -->
        <q-menu
          anchor="top end"
          self="top start"
          v-model="showDeleteOptions"
        >
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup @click="$emit('delete-message', 'self')">
              <q-item-section>Удалить у себя</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$emit('delete-message', 'all')">
              <q-item-section>Удалить для всех</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOwn: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'sent' // sent, delivered, read
  }
})

const emit = defineEmits(['edit-message', 'delete-message'])

const showMenu = ref(false)
const showDeleteOptions = ref(false)

const showContextMenu = () => {
  showMenu.value = true
  showDeleteOptions.value = false
}

const statusIcon = computed(() => {
  switch (props.status) {
    case 'read':
      return 'done_all'
    case 'delivered':
      return 'done_all'
    default:
      return 'done'
  }
})

const statusColor = computed(() => {
  switch (props.status) {
    case 'read':
      return 'light-blue'
    case 'delivered':
      return 'grey'
    default:
      return 'grey'
  }
})
</script>

<style lang="scss" scoped>
.message-container {
  display: flex;
  align-items: flex-end;
  margin-bottom: 4px;
  width: 100%;
}

.message-avatar {
  margin-right: 8px;
  border: 1px solid var(--darkreader-bg--q-dark);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 2px;
}

.message-bubble {
  max-width: 40%;
  width: fit-content;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  padding: 4px 8px;

  &--own {
    margin-left: auto;
    background: var(--q-primary);
    color: white;
    border-bottom-right-radius: 4px;

    .message-text {
      color: white;
    }
    
    .text-grey-7 {
      color: rgba(255, 255, 255, 0.7) !important;
    }
  }

  &--other {
    background: var(--message-bubble-bg);
    border-bottom-left-radius: 4px;
    color: var(--darkreader-text--q-dark);
  }
}

.message-wrapper {
  flex: 1;
  min-width: 0;
}

.message-content {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  min-width: 0;
  position: relative;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.3;
  font-size: 0.9rem;
  overflow-wrap: break-word;
  word-break: break-word;
  padding-right: 4px;
  margin-bottom: 0;
}

.message-meta {
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
  margin-bottom: 1px;
  line-height: 1;

  .q-icon {
    height: 12px;
    margin-bottom: 1px;
  }
}

.message-time {
  font-size: 0.65rem;
  opacity: 0.7;
  white-space: nowrap;
  line-height: 1;
}
</style> 
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
        <div class="message-content" :class="{ 'with-files': files?.length }">
          <div v-if="files?.length" class="files-content q-mb-sm">
            <div 
              v-for="(file, index) in files" 
              :key="index"
              class="file-item q-mb-sm"
            >
              <div v-if="file.type.startsWith('image/')" class="image-preview">
                <img :src="file.url" @click="openFile(file)" />
                <q-btn
                  flat
                  round
                  dense
                  icon="download"
                  class="download-btn"
                  @click.stop="downloadFile(file)"
                />
              </div>
              <div v-else class="file-info">
                <q-icon :name="getFileIcon(file.type)" size="24px" class="q-mr-sm" />
                <div class="file-details" @click="openFile(file)">
                  <div class="file-name text-weight-medium">{{ file.name }}</div>
                  <div class="file-size text-caption">{{ formatFileSize(file.size) }}</div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="download"
                  @click.stop="downloadFile(file)"
                />
              </div>
            </div>
          </div>
          <div v-if="text" class="message-text">{{ text }}</div>
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
      class="message-context-menu"
    >
      <q-list style="width: 200px">
        <q-item clickable v-close-popup @click="$emit('edit-message')" :disable="!isOwn">
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

    <!-- Модальное окно для просмотра изображений -->
    <q-dialog v-model="showImageDialog" maximized>
      <q-card class="image-dialog">
        <q-card-section class="image-dialog-header">
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="image-dialog-content">
          <img :src="selectedImage?.url" v-if="selectedImage" />
        </q-card-section>
      </q-card>
    </q-dialog>
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
    default: 'sent'
  },
  files: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit-message', 'delete-message'])

const showMenu = ref(false)
const showDeleteOptions = ref(false)
const showImageDialog = ref(false)
const selectedImage = ref(null)

const showContextMenu = () => {
  showMenu.value = true
  showDeleteOptions.value = false
}

const downloadFile = (file) => {
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadAllFiles = () => {
  props.files.forEach(file => downloadFile(file))
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

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'movie'
  if (type.startsWith('audio/')) return 'audiotrack'
  if (type.includes('pdf')) return 'picture_as_pdf'
  if (type.includes('word')) return 'description'
  if (type.includes('excel') || type.includes('spreadsheet')) return 'table_view'
  return 'insert_drive_file'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const openFile = (file) => {
  if (file.type.startsWith('image/')) {
    selectedImage.value = file
    showImageDialog.value = true
  } else if (file.url) {
    window.open(file.url, '_blank')
  }
}
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
  min-width: 0;
  position: relative;
  flex-direction: row;
  justify-content: space-between;

  &.with-files {
    flex-direction: column;
    justify-content: flex-start;

    .message-meta {
      align-self: flex-end;
    }
  }
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
  flex: 1;
}

.message-meta {
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
  margin-bottom: 1px;
  line-height: 1;
  margin-left: auto;

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

.files-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .file-item {
    &:last-child {
      margin-bottom: 0;
    }
  }

  .image-preview {
    max-width: 300px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    position: relative;

    img {
      width: 100%;
      height: auto;
      display: block;
    }

    .download-btn {
      position: absolute;
      right: 8px;
      bottom: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: white;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    padding: 8px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    transition: background-color 0.2s ease;

    .file-details {
      min-width: 0;
      flex: 1;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.message-bubble--own {
  .file-info {
    background: rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.message-context-menu {
  :deep(.q-item) {
    min-height: 40px;
    padding: 8px 16px;
  }

  :deep(.q-item__label) {
    line-height: 20px;
    white-space: nowrap;
  }
}

.image-dialog {
  background: rgba(0, 0, 0, 0.9);
  
  .image-dialog-header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    padding: 8px;

    .q-btn {
      color: white;
      background: rgba(0, 0, 0, 0.5);
      
      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }

  .image-dialog-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 0;

    img {
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
    }
  }
}
</style> 
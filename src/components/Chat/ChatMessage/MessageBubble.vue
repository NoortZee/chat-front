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
            <span class="message-time text-caption text-grey-7">
              {{ time }}
              <span v-if="isEdited" class="edited-mark">(изменено)</span>
            </span>
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
        <q-item clickable v-close-popup @click="handleEditClick" :disable="!isOwn">
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
    <q-dialog v-model="showImageDialog" maximized @keydown.prevent="handleKeyDown">
      <div class="fullscreen-dialog" @click="showImageDialog = false" @wheel="handleWheel">
        <div class="image-container" @click.stop>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="showImageDialog = false"
          />
          <img 
            :src="selectedImage?.url" 
            v-if="selectedImage" 
            :style="{ transform: `scale(${zoomLevel})` }"
            ref="imageRef"
          />
        </div>
      </div>
    </q-dialog>

    <!-- Диалог редактирования сообщения -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Редактирование сообщения</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input
            v-model="editedText"
            type="textarea"
            label="Сообщение"
            autogrow
            :rules="[val => !!val.trim() || 'Сообщение не может быть пустым']"
          />

          <div class="files-section q-mt-md" v-if="editedFiles.length">
            <div class="text-subtitle2 q-mb-sm">Прикрепленные файлы:</div>
            <q-list separator>
              <q-item v-for="(file, index) in editedFiles" :key="index">
                <q-item-section>
                  <q-item-label>{{ file.name }}</q-item-label>
                  <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="close"
                    @click="removeFile(index)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="row justify-between items-center q-mt-md">
            <q-btn
              flat
              color="primary"
              icon="attach_file"
              label="Прикрепить файл"
              @click="triggerFileInput"
            />
            <input
              type="file"
              ref="fileInput"
              multiple
              class="hidden"
              @change="onFileSelect"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Отмена" color="primary" v-close-popup />
          <q-btn
            label="Сохранить"
            color="primary"
            :disable="!editedText.trim()"
            @click="saveEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  },
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
  },
  isEdited: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit-message', 'delete-message'])

const showMenu = ref(false)
const showDeleteOptions = ref(false)
const showEditDialog = ref(false)
const editedText = ref('')
const editedFiles = ref([])
const fileInput = ref(null)
const showImageDialog = ref(false)
const selectedImage = ref(null)
const zoomLevel = ref(1)
const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1
const imageRef = ref(null)

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

const handleWheel = (event) => {
  if (event.ctrlKey) {
    event.preventDefault()
    event.stopPropagation()
    
    const img = imageRef.value
    if (!img) return

    const rect = img.getBoundingClientRect()
    const mouseX = (event.clientX - rect.left) / rect.width
    const mouseY = (event.clientY - rect.top) / rect.height

    const oldZoom = zoomLevel.value
    if (event.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }

    // Обновляем точку трансформации
    img.style.transformOrigin = `${mouseX * 100}% ${mouseY * 100}%`
  }
}

const handleKeyDown = (event) => {
  if (event.ctrlKey) {
    if (event.key === '=' || event.key === '+') {
      event.preventDefault()
      const img = imageRef.value
      if (img) {
        // При масштабировании клавишами используем центр изображения
        img.style.transformOrigin = 'center center'
      }
      zoomIn()
    } else if (event.key === '-') {
      event.preventDefault()
      const img = imageRef.value
      if (img) {
        img.style.transformOrigin = 'center center'
      }
      zoomOut()
    }
  }
}

const zoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) {
    zoomLevel.value = Math.min(zoomLevel.value + ZOOM_STEP, MAX_ZOOM)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) {
    zoomLevel.value = Math.max(zoomLevel.value - ZOOM_STEP, MIN_ZOOM)
  }
}

watch(showImageDialog, (newValue) => {
  if (!newValue) {
    zoomLevel.value = 1
    if (imageRef.value) {
      imageRef.value.style.transformOrigin = 'center center'
    }
  }
})

const triggerFileInput = () => {
  nextTick(() => {
    if (fileInput.value) {
      fileInput.value.click()
    }
  })
}

const startEdit = () => {
  showEditDialog.value = true
  nextTick(() => {
    editedText.value = props.text || ''
    editedFiles.value = Array.isArray(props.files) ? [...props.files] : []
  })
}

const removeFile = (index) => {
  if (Array.isArray(editedFiles.value)) {
    editedFiles.value.splice(index, 1)
  }
}

const onFileSelect = (event) => {
  if (event.target?.files) {
    const newFiles = Array.from(event.target.files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }))
    editedFiles.value = Array.isArray(editedFiles.value) ? [...editedFiles.value, ...newFiles] : newFiles
    event.target.value = ''
  }
}

const saveEdit = () => {
  if (editedText.value?.trim()) {
    emit('edit-message', {
      id: props.id,
      text: editedText.value.trim(),
      files: Array.isArray(editedFiles.value) ? editedFiles.value : [],
      isEdited: true
    })
    showEditDialog.value = false
    // Очищаем состояние после закрытия
    editedText.value = ''
    editedFiles.value = []
  }
}

// Добавляем очистку при закрытии диалога
watch(showEditDialog, (newValue) => {
  if (!newValue) {
    editedText.value = ''
    editedFiles.value = []
  }
})

// Изменяем обработчик клика по пункту меню редактирования
const handleEditClick = () => {
  showMenu.value = false // Закрываем контекстное меню
  startEdit()
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

  .edited-mark {
    margin-left: 4px;
    font-style: italic;
  }
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

.fullscreen-dialog {
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .close-btn {
    position: fixed;
    top: 16px;
    right: 16px;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
}

.image-container {
  position: relative;
  max-width: 95%;
  max-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 95vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    transition: transform 0.1s ease-out;
    transform-origin: center center;
    user-select: none;
    pointer-events: none;
  }
}

.image-dialog {
  display: none;
}
</style> 
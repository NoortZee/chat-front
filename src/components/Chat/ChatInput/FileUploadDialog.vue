<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Загрузка файлов</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <div 
          class="drop-zone q-mb-md"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          :class="{ 'drag-over': isDragOver }"
        >
          <div class="text-center">
            <q-icon name="cloud_upload" size="48px" color="primary" />
            <div class="text-h6 q-mt-sm">Перетащите файлы сюда</div>
            <div class="text-caption q-mt-sm">или</div>
            <q-btn
              flat
              color="primary"
              label="Выберите файлы"
              class="q-mt-sm"
              @click="$refs.fileInput.click()"
            />
            <input
              type="file"
              ref="fileInput"
              multiple
              class="hidden"
              @change="handleFileSelect"
            />
          </div>
        </div>

        <div class="files-preview q-mb-md" v-if="files.length > 0">
          <q-list separator>
            <q-item v-for="(file, index) in files" :key="index">
              <q-item-section avatar>
                <q-icon :name="getFileIcon(file.type)" size="28px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ file.name }}</q-item-label>
                <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense icon="close" @click="removeFile(index)" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <q-input
          v-model="description"
          type="textarea"
          label="Описание"
          rows="3"
          autogrow
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="primary" v-close-popup />
        <q-btn 
          label="Отправить" 
          color="primary" 
          :loading="uploading"
          @click="uploadFiles" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialFiles: {
    type: Array,
    default: () => []
  },
  initialDescription: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'upload'])

const show = ref(props.modelValue)
const files = ref([])
const description = ref('')
const uploading = ref(false)
const isDragOver = ref(false)
const fileInput = ref(null)

watch(() => props.modelValue, (val) => {
  show.value = val
  if (val) {
    files.value = [...(props.initialFiles || [])]
    description.value = props.initialDescription || ''
  }
})

watch(() => show.value, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    files.value = []
    description.value = ''
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

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const uploadFiles = async () => {
  uploading.value = true
  try {
    await emit('upload', {
      files: files.value,
      description: description.value
    })
    show.value = false
  } finally {
    uploading.value = false
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const droppedFiles = Array.from(event.dataTransfer.files)
  files.value = [...files.value, ...droppedFiles]
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  files.value = [...files.value, ...selectedFiles]
  event.target.value = '' // Сброс input для возможности повторного выбора тех же файлов
}
</script>

<style lang="scss" scoped>
.files-preview {
  max-height: 200px;
  overflow-y: auto;
}

.drop-zone {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--q-primary);
  }

  &.drag-over {
    border-color: var(--q-primary);
    background: rgba(0, 0, 0, 0.05);
  }
}

.hidden {
  display: none;
}
</style> 
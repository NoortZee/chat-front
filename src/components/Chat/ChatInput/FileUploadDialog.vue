<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Загрузка файлов</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <div class="files-preview q-mb-md">
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

watch(() => props.modelValue, (val) => {
  show.value = val
})

watch(() => show.value, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    files.value = []
    description.value = ''
  }
})

watch(() => props.initialFiles, (val) => {
  files.value = val
}, { immediate: true })

watch(() => props.initialDescription, (val) => {
  description.value = val
}, { immediate: true })

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
</script>

<style lang="scss" scoped>
.files-preview {
  max-height: 200px;
  overflow-y: auto;
}
</style> 
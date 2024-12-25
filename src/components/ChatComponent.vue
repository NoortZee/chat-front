<template>
  <div class="chat-component">
    <q-splitter
      v-model="splitterModel"
      :limits="[20, 40]"
    >
      <template v-slot:before>
        <div class="column full-height">
          <div class="chat-header q-pa-sm row items-center">
            <q-input
              v-model="searchQuery"
              dense
              placeholder="Поиск чата..."
              class="col"
              borderless
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-btn flat round icon="add" @click="showNewChatDialog = true" />
          </div>

          <div class="chat-list-container">
            <ArchivedChats
              v-if="hasArchivedChats"
              :archived-chats="filteredArchivedChats"
              :selected-chat-id="selectedChatId"
              @select-chat="selectChat"
              @unarchive-chat="unarchiveChat"
              @unarchive-all="unarchiveAllChats"
              @delete-chat="deleteChat"
            />
            <ChatList
              :chats="filteredChats"
              :selected-chat-id="selectedChatId"
              @select-chat="selectChat"
              @archive-chat="archiveChat"
              @delete-chat="deleteChat"
            />
          </div>
        </div>
      </template>

      <template v-slot:after>
        <div v-if="selectedChat" class="column full-height">
          <div class="chat-header q-pa-sm row items-center">
            <q-avatar size="40px" class="q-mr-sm">
              <img :src="selectedChat.avatar || 'https://cdn.quasar.dev/img/avatar.png'" />
            </q-avatar>
            <div class="col">
              <div class="text-weight-bold">{{ selectedChat.name }}</div>
              <div class="text-caption text-grey">{{ selectedChat.status }}</div>
            </div>
            <q-btn flat round icon="more_vert">
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item clickable v-close-popup @click="clearChat">
                    <q-item-section>Очистить чат</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="deleteChat">
                    <q-item-section class="text-negative">Удалить чат</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <div class="chat-messages q-pa-sm" ref="messagesContainer">
            <div 
              class="messages-drop-zone" 
              @dragover.prevent="handleDragOver" 
              @dragleave.prevent="handleDragLeave" 
              @drop.prevent="handleDrop" 
              :class="{ 'drag-over': isDragOver }"
            >
              <MessageBubble
                v-for="message in selectedChat.messages"
                :key="message.id"
                :id="message.id"
                :is-own="message.userId === currentUserId"
                :text="message.text"
                :time="message.time"
                :username="message.username"
                :avatar="message.avatar"
                :status="message.status"
                :files="message.files"
                :is-edited="message.isEdited"
                :type="message.type"
                :audio-url="message.audioUrl"
                :duration="message.duration"
                @edit-message="editMessage(message, $event)"
                @delete-message="deleteMessage(message, $event)"
              />
            </div>
          </div>

          <ChatInputBox
            @send="sendMessage"
            @attachment-click="handleAttachment"
            @voice-message="handleVoiceMessage"
            v-model="currentMessage"
          />
        </div>
        <div v-else class="column full-height items-center justify-center text-grey">
          <q-icon name="chat" size="48px" />
          <div class="q-mt-sm">Выберите чат для начала общения</div>
        </div>
      </template>
    </q-splitter>

    <BaseDialog
      v-model="showNewChatDialog"
      title="Новый чат"
      :width="400"
    >
      <q-form @submit="createNewChat">
        <q-input
          v-model="newChatName"
          label="Название чата"
          :rules="[val => !!val || 'Обязательное поле']"
          class="q-mb-md"
        />
        <div class="row justify-end">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn
            :loading="creating"
            color="primary"
            label="Создать"
            type="submit"
          />
        </div>
      </q-form>
    </BaseDialog>

    <FileUploadDialog
      v-model="showUploadDialog"
      :initial-files="selectedFiles"
      :initial-description="currentMessage"
      @upload="handleUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import ChatList from './Chat/ChatList/ChatList.vue'
import ArchivedChats from './Chat/ChatList/ArchivedChats.vue'
import MessageBubble from './Chat/ChatMessage/MessageBubble.vue'
import ChatInputBox from './Chat/ChatInput/ChatInputBox.vue'
import BaseDialog from './UI/Dialogs/BaseDialog.vue'
import FileUploadDialog from './Chat/ChatInput/FileUploadDialog.vue'

// Состояние компонента
const splitterModel = ref(20)
const searchQuery = ref('')
const selectedChatId = ref(null)
const showNewChatDialog = ref(false)
const newChatName = ref('')
const creating = ref(false)
const messagesContainer = ref(null)
const currentUserId = '1' // В реальном приложении получаем из хранилища

// Добавляем состояние для drag and drop
const isDragOver = ref(false)
const showUploadDialog = ref(false)
const selectedFiles = ref([])
const currentMessage = ref('')

// Моковые данные (в реальном приложении получаем с бэкенда)
const chats = ref([
  {
    id: 1,
    name: 'Общий чат',
    avatar: '',
    lastMessage: 'Привет всем!',
    lastMessageTime: '10:30',
    unreadCount: 2,
    status: 'online',
    messages: [
      {
        id: 1,
        userId: '2',
        username: 'Иван',
        text: 'Привет всем!',
        time: '10:30',
        status: 'read'
      }
    ]
  }
])

// Вычисляемые свойства
const filteredChats = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return chats.value
    .filter(chat => !chat.archived)
    .filter(chat =>
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    )
})

const filteredArchivedChats = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return chats.value
    .filter(chat => chat.archived)
    .filter(chat =>
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    )
})

const selectedChat = computed(() =>
  chats.value.find(chat => chat.id === selectedChatId.value)
)

// Добавляем вычисляемое свойство для проверки наличия архивированных чатов
const hasArchivedChats = computed(() => {
  return chats.value.some(chat => chat.archived)
})

// Методы
const selectChat = (chatId) => {
  selectedChatId.value = chatId
}

const sendMessage = (text) => {
  if (!selectedChat.value) return

  const message = {
    id: Date.now(),
    userId: currentUserId,
    username: 'Вы',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent'
  }

  selectedChat.value.messages.push(message)
  selectedChat.value.lastMessage = text
  selectedChat.value.lastMessageTime = message.time

  scrollToBottom()
}

const handleAttachment = ({ files, description }) => {
  if (!selectedChat.value) return
  
  selectedFiles.value = files || []
  currentMessage.value = description
  showUploadDialog.value = true
}

const createNewChat = async () => {
  if (!newChatName.value.trim()) return

  creating.value = true
  try {
    // В реальном приложении отправляем запрос на бэкенд
    const newChat = {
      id: Date.now(),
      name: newChatName.value,
      avatar: '',
      lastMessage: 'Чат создан',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      status: 'online',
      messages: []
    }

    chats.value.unshift(newChat)
    selectedChatId.value = newChat.id
    showNewChatDialog.value = false
    newChatName.value = ''
  } finally {
    creating.value = false
  }
}

const clearChat = () => {
  if (selectedChat.value) {
    selectedChat.value.messages = []
  }
}

const deleteChat = (chatId) => {
  // Если chatId не передан, используем ID выбранного чата
  const targetId = chatId || selectedChat.value?.id
  if (targetId) {
    const index = chats.value.findIndex(chat => chat.id === targetId)
    if (index !== -1) {
      chats.value.splice(index, 1)
      if (selectedChatId.value === targetId) {
        selectedChatId.value = null
      }
    }
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Следим за изменениями сообщений для автоматической прокрутки
watch(
  () => selectedChat.value?.messages,
  () => scrollToBottom(),
  { deep: true }
)

onMounted(() => {
  scrollToBottom()
})

const archiveChat = (chatId) => {
  const index = chats.value.findIndex(chat => chat.id === chatId)
  if (index !== -1) {
    const chat = chats.value[index]
    chat.archived = true
    if (selectedChatId.value === chatId) {
      selectedChatId.value = null
    }
  }
}

const editMessage = (message, editData) => {
  if (!selectedChat.value) return

  const messageIndex = selectedChat.value.messages.findIndex(m => m.id === message.id)
  if (messageIndex === -1) return

  // Обновляем сообщение с новыми данными
  selectedChat.value.messages[messageIndex] = {
    ...selectedChat.value.messages[messageIndex],
    text: editData.text,
    files: editData.files,
    isEdited: true,
    editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Обновляем lastMessage если это было последнее сообщение
  if (messageIndex === selectedChat.value.messages.length - 1) {
    selectedChat.value.lastMessage = editData.text
    selectedChat.value.lastMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

const deleteMessage = (message, type) => {
  if (!selectedChat.value) return

  const messageIndex = selectedChat.value.messages.findIndex(m => m.id === message.id)
  if (messageIndex === -1) return

  // Очищаем URL для голосовых сообщений
  if (message.type === 'voice' && message.audioUrl) {
    URL.revokeObjectURL(message.audioUrl)
  }

  if (type === 'all') {
    selectedChat.value.messages.splice(messageIndex, 1)
    
    if (messageIndex === selectedChat.value.messages.length) {
      const lastMessage = selectedChat.value.messages[selectedChat.value.messages.length - 1]
      selectedChat.value.lastMessage = lastMessage ? lastMessage.text : 'Нет сообщений'
      selectedChat.value.lastMessageTime = lastMessage ? lastMessage.time : ''
    }
  } else if (type === 'self') {
    selectedChat.value.messages[messageIndex] = {
      ...selectedChat.value.messages[messageIndex],
      deletedFor: [...(selectedChat.value.messages[messageIndex].deletedFor || []), currentUserId]
    }
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = true
  event.dataTransfer.dropEffect = 'copy'
}

const handleDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()
  
  // Проверяем, что мышь действительно покинула зону
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
    isDragOver.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files)
  if (files.length > 0) {
    selectedFiles.value = files
    showUploadDialog.value = true
  }
}

const handleUpload = ({ files, description }) => {
  if (!selectedChat.value || !files.length) return

  // Создаем одно сообщение для всех файлов
  const message = {
    id: Date.now() + Math.random(),
    userId: currentUserId,
    username: 'Вы',
    text: description || '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent',
    files: files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))
  }

  selectedChat.value.messages.push(message)
  selectedChat.value.lastMessage = description || 'Файлы'
  selectedChat.value.lastMessageTime = message.time

  scrollToBottom()
  selectedFiles.value = []
  currentMessage.value = ''
  showUploadDialog.value = false
}

// Добавляем метод разархивации
const unarchiveChat = (chatId) => {
  const index = chats.value.findIndex(chat => chat.id === chatId)
  if (index !== -1) {
    const chat = chats.value[index]
    chat.archived = false
  }
}

// Добавляем метод для разархивации всех чатов
const unarchiveAllChats = () => {
  chats.value.forEach(chat => {
    if (chat.archived) {
      chat.archived = false
    }
  })
}

// Обновляем обработчик голосовых сообщений
const handleVoiceMessage = (audioBlob) => {
  if (!selectedChat.value) return

  // Создаем временный URL для аудио
  const audioUrl = URL.createObjectURL(audioBlob)
  
  // Создаем объект сообщения
  const message = {
    id: Date.now(),
    userId: currentUserId,
    username: 'Вы',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent',
    type: 'voice',
    audioUrl,
    duration: 0 // Будет обновлено после загрузки аудио
  }

  // Получаем длительность аудио
  const audio = new Audio(audioUrl)
  audio.addEventListener('loadedmetadata', () => {
    message.duration = Math.round(audio.duration)
    // Обновляем сообщение для триггера реактивности
    const index = selectedChat.value.messages.findIndex(m => m.id === message.id)
    if (index !== -1) {
      selectedChat.value.messages[index] = { ...message }
    }
  })

  // Добавляем сообщение в чат
  selectedChat.value.messages.push(message)
  selectedChat.value.lastMessage = '🎤 Голосовое сообщение'
  selectedChat.value.lastMessageTime = message.time

  scrollToBottom()
}
</script>

<style lang="scss" scoped>
.chat-component {
  height: 100%;
  color: var(--darkreader-text--q-dark);

  :deep(.q-splitter) {
    height: 100%;
  }

  .chat-header {
    background: var(--darkreader-bg--q-dark);
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 100;

    .q-input {
      color: var(--darkreader-text--q-dark);
      &::placeholder {
        color: rgba(214, 210, 205, 0.7);
      }

      :deep(.q-icon) {
        color: var(--darkreader-text--q-dark);
        opacity: 0.7;
      }

      :deep(.q-field__native) {
        color: var(--darkreader-text--q-dark);
        &::placeholder {
          color: rgba(214, 210, 205, 0.7);
        }
      }
    }
  }

  .chat-list-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background: var(--darkreader-bg--q-dark);
    min-height: 0;

    :deep(.q-list) {
      padding: 0;
    }
  }

  .chat-tabs {
    :deep(.q-tabs) {
      background: transparent;
      
      .q-tab {
        min-height: 40px;
        padding: 0 16px;
        
        &--active {
          color: var(--q-primary);
          font-weight: 500;
        }
        
        &__label {
          font-size: 0.9rem;
        }
      }
      
      .q-tab__indicator {
        height: 3px;
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    background: var(--darkreader-bg--q-dark);
    padding: 16px;
    position: relative;
    height: 0;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--darkreader-border--q-dark);
      border-radius: 3px;
    }
  }

  .messages-drop-zone {
    min-height: 100%;
    position: relative;
    width: 100%;
    
    &.drag-over {
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(var(--q-primary), 0.1);
        border: 2px dashed var(--q-primary);
        border-radius: 8px;
        pointer-events: none;
        z-index: 1;
      }
    }

    :deep(.image-preview) {
      max-width: 100% !important;
      width: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }

  .column.full-height {
    height: 100vh;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  :deep(.q-splitter__separator) {
    width: 1px;
    color: var(--darkreader-bg--q-dark);
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
  }

  :deep(.q-input) {
    .q-field__control {
      background: var(--q-dark-page);
      border-radius: 24px;
      padding: 0 12px;
      color: white;
    }
    .q-field__native {
      color: white;
    }
    .q-field__label {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  :deep(.q-menu) {
    background: var(--q-dark);
    color: white;
    .q-item {
      color: white;
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  .text-grey {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}
</style> 
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

          <ChatList
            :chats="filteredChats"
            :selected-chat-id="selectedChatId"
            @select-chat="selectChat"
            @archive-chat="archiveChat"
            @delete-chat="deleteChat"
          />
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
            <MessageBubble
              v-for="message in selectedChat.messages"
              :key="message.id"
              :is-own="message.userId === currentUserId"
              :text="message.text"
              :time="message.time"
              :username="message.username"
              :avatar="message.avatar"
              :status="message.status"
              @edit-message="editMessage(message)"
              @delete-message="deleteMessage(message, $event)"
            />
          </div>

          <ChatInputBox
            @send="sendMessage"
            @attachment-click="handleAttachment"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import ChatList from './Chat/ChatList/ChatList.vue'
import MessageBubble from './Chat/ChatMessage/MessageBubble.vue'
import ChatInputBox from './Chat/ChatInput/ChatInputBox.vue'
import BaseDialog from './UI/Dialogs/BaseDialog.vue'

// Состояние компонента
const splitterModel = ref(20)
const searchQuery = ref('')
const selectedChatId = ref(null)
const showNewChatDialog = ref(false)
const newChatName = ref('')
const creating = ref(false)
const messagesContainer = ref(null)
const currentUserId = '1' // В реальном приложении получаем из хранилища

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
    .filter(chat => !chat.archived) // Фильтруем архивированные
    .filter(chat =>
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage.toLowerCase().includes(query)
    )
})

const selectedChat = computed(() =>
  chats.value.find(chat => chat.id === selectedChatId.value)
)

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

const handleAttachment = () => {
  // Реализация загрузки файлов
  console.log('Attachment clicked')
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

const editMessage = (message) => {
  // В реальном приложении здесь будет открываться диалог редактирования
  console.log('Редактирование сообщения:', message)
}

const deleteMessage = (message, type) => {
  if (!selectedChat.value) return

  const messageIndex = selectedChat.value.messages.findIndex(m => m.id === message.id)
  if (messageIndex === -1) return

  if (type === 'all') {
    // В реальном приложении здесь будет запрос на сервер для удаления у всех
    selectedChat.value.messages.splice(messageIndex, 1)
  } else if (type === 'self') {
    // В реальном приложении здесь будет запрос на сервер для скрытия у текущего пользователя
    message.hiddenFor = message.hiddenFor || []
    message.hiddenFor.push(currentUserId)
  }

  // Обновляем lastMessage если удалили последнее сообщение
  if (messageIndex === selectedChat.value.messages.length - 1) {
    const lastMessage = selectedChat.value.messages[selectedChat.value.messages.length - 1]
    selectedChat.value.lastMessage = lastMessage ? lastMessage.text : 'Нет сообщений'
  }
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

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    background: var(--darkreader-bg--q-dark);
    padding: 16px;
    
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

  .column.full-height {
    height: 100vh;
    display: flex;
    flex-direction: column;
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
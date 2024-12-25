<template>
  <div class="chat-input-box q-pa-sm">
    <form @submit.prevent="onSubmit" class="row items-center">
      <q-btn
        round
        flat
        icon="attach_file"
        class="attach-btn q-mr-sm"
        @click="handleAttachmentClick"
      />
      <div class="custom-input-wrapper col">
        <textarea
          v-model="message"
          class="custom-textarea"
          rows="1"
          placeholder="Введите сообщение..."
          @keypress.enter.prevent="onSubmit"
          @input="autoResize"
          @paste="handlePaste"
          ref="textareaRef"
        ></textarea>
        <template v-if="message.trim()">
          <q-btn
            round
            flat
            icon="send"
            color="primary"
            class="send-btn"
            @click="onSubmit"
          />
        </template>
        <template v-else>
          <voice-message
            class="voice-message-btn"
            @voice-recorded="handleVoiceMessage"
          />
        </template>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VoiceMessage from 'components/VoiceMessage.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['send', 'attachment-click', 'update:modelValue', 'voice-message'])
const message = ref(props.modelValue)
const textareaRef = ref(null)

watch(() => props.modelValue, (newVal) => {
  message.value = newVal
})

watch(() => message.value, (newVal) => {
  emit('update:modelValue', newVal)
})

const onSubmit = () => {
  if (message.value.trim()) {
    emit('send', message.value)
    message.value = ''
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}

const autoResize = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

const handleAttachmentClick = () => {
  emit('attachment-click', { files: [], description: message.value })
  message.value = ''
}

const handlePaste = async (event) => {
  const items = event.clipboardData.items
  const files = []

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }

  if (files.length > 0) {
    event.preventDefault()
    emit('attachment-click', { files, description: message.value })
    message.value = ''
  }
}

const handleVoiceMessage = (audioBlob) => {
  emit('voice-message', audioBlob)
}
</script>

<style lang="scss" scoped>
.chat-input-box {
  background: var(--darkreader-bg--q-dark);
  border-top: 1px solid var(--divider-color);
  padding: 8px 16px;
}

.hidden-input {
  display: none;
}

.custom-input-wrapper {
  position: relative;
  display: flex;
  align-items: stretch;
  background: var(--message-bubble-bg);
  border-radius: 24px;
  padding: 8px 16px;
  min-height: 48px;
  transition: background-color 0.2s ease;

  &:focus-within {
    background: var(--active-bg);
  }
}

.custom-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  max-height: 120px;
  padding: 4px 0;
  margin: 0;
  width: calc(100% - 48px);
  color: var(--darkreader-text--q-dark);
  vertical-align: middle;
  min-height: 24px;
  height: 24px;
  overflow-y: hidden;

  &::placeholder {
    color: var(--secondary-text);
  }

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

.send-btn, .voice-message-btn {
  position: absolute;
  right: 8px;
  bottom: 50%;
  transform: translateY(50%);
  color: var(--q-primary);
  opacity: 0.9;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}
</style> 
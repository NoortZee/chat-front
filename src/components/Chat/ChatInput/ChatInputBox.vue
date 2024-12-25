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
          ref="textareaRef"
        ></textarea>
        <q-btn
          round
          flat
          :icon="message.trim() ? 'send' : 'mic'"
          :color="message.trim() ? 'primary' : 'grey'"
          class="send-btn"
          @click="onSubmit"
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['send', 'attachment-click', 'update:modelValue'])
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
  align-items: center;
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

.send-btn {
  position: absolute;
  right: 8px;
  bottom: 4px;
  color: var(--q-primary);
  opacity: 0.9;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}
</style> 
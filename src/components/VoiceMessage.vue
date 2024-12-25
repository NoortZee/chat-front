<template>
  <div class="voice-message">
    <q-btn
      round
      :color="isRecording ? 'negative' : 'grey'"
      :icon="isRecording ? 'stop' : 'mic'"
      @click="toggleRecording"
      :loading="isInitializing"
    />
    <span v-if="isRecording" class="recording-timer">{{ formattedDuration }}</span>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import RecordRTC from 'recordrtc'
import { useQuasar } from 'quasar'

export default {
  name: 'VoiceMessage',
  
  setup(props, { emit }) {
    const $q = useQuasar()
    const isRecording = ref(false)
    const isInitializing = ref(false)
    const recorder = ref(null)
    const startTime = ref(null)
    const duration = ref(0)
    const timerInterval = ref(null)
    let stream = null

    // Форматирование времени записи
    const formattedDuration = computed(() => {
      const minutes = Math.floor(duration.value / 60)
      const seconds = duration.value % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })

    // Обновление таймера
    const updateTimer = () => {
      if (startTime.value) {
        duration.value = Math.floor((Date.now() - startTime.value) / 1000)
      }
    }

    // Начало записи
    const startRecording = async () => {
      try {
        isInitializing.value = true
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        })

        recorder.value = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm',
          recorderType: RecordRTC.StereoAudioRecorder,
          numberOfAudioChannels: 1,
          desiredSampRate: 44100,
          bufferSize: 16384
        })
        
        recorder.value.startRecording()
        isRecording.value = true
        startTime.value = Date.now()
        timerInterval.value = setInterval(updateTimer, 1000)

        $q.notify({
          type: 'positive',
          message: 'Запись началась',
          position: 'top',
          timeout: 1000
        })
      } catch (error) {
        console.error('Ошибка при запуске записи:', error)
        let errorMessage = 'Произошла ошибка при запуске записи'
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Необходимо разрешить доступ к микрофону'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Микрофон не найден'
        }

        $q.notify({
          type: 'negative',
          message: errorMessage,
          position: 'top'
        })
      } finally {
        isInitializing.value = false
      }
    }

    // Остановка записи
    const stopRecording = () => {
      if (recorder.value) {
        recorder.value.stopRecording(() => {
          const blob = recorder.value.getBlob()
          emit('voice-recorded', blob)
          recorder.value = null
          isRecording.value = false
          clearInterval(timerInterval.value)
          duration.value = 0

          // Останавливаем все треки медиапотока
          if (stream) {
            stream.getTracks().forEach(track => track.stop())
          }

          $q.notify({
            type: 'positive',
            message: 'Голосовое сообщение записано',
            position: 'top',
            timeout: 1000
          })
        })
      }
    }

    // Переключение записи
    const toggleRecording = () => {
      if (isRecording.value) {
        stopRecording()
      } else {
        startRecording()
      }
    }

    // Очистка при уничтожении компонента
    onUnmounted(() => {
      if (recorder.value) {
        recorder.value.stopRecording()
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      clearInterval(timerInterval.value)
    })

    return {
      isRecording,
      isInitializing,
      toggleRecording,
      formattedDuration
    }
  }
}
</script>

<style scoped>
.voice-message {
  display: flex;
  align-items: center;
}

.recording-timer {
  color: var(--q-negative);
  min-width: 45px;
  margin-left: 8px;
}
</style> 
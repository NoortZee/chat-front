<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <h5>Пример записи голосового сообщения</h5>
      <voice-message />
    </div>
  </q-page>
</template>

<script>
import VoiceMessage from 'components/VoiceMessage.vue'

export default {
  name: 'IndexPage',
  components: {
    VoiceMessage
  }
}
</script>

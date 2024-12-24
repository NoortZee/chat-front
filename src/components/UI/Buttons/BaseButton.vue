<template>
  <q-btn
    :color="color"
    :flat="flat"
    :outline="outline"
    :rounded="rounded"
    :size="size"
    :loading="loading"
    :disable="disable"
    :icon="icon"
    :label="label"
    @click="$emit('click')"
    class="base-button"
  >
    <slot></slot>
  </q-btn>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  flat: {
    type: Boolean,
    default: false
  },
  outline: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'md'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.base-button {
  font-weight: 500;
  text-transform: none;
}
</style> 
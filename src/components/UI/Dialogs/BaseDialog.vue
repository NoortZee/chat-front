<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="persistent"
    :maximized="maximized"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="base-dialog" :style="{ maxWidth: width + 'px' }">
      <q-card-section class="row items-center q-pb-none" v-if="title">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn
          v-if="!hideClose"
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <slot></slot>
      </q-card-section>

      <q-card-actions align="right" v-if="$slots.actions">
        <slot name="actions"></slot>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  persistent: {
    type: Boolean,
    default: false
  },
  maximized: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 500
  },
  hideClose: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
:deep(.q-dialog__inner) {
  background: var(--q-dark-page) !important;
}

.base-dialog {
  min-width: 300px;
  border-radius: 8px;
  background: var(--q-dark);
  color: white;

  :deep(.q-card__section) {
    background: var(--q-dark);
    color: white;
  }

  :deep(.q-card__actions) {
    background: var(--q-dark);
  }

  :deep(.q-input) {
    .q-field__control {
      background: var(--q-dark-page);
      color: white;
    }
    .q-field__native {
      color: white;
    }
    .q-field__label {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  :deep(.q-btn) {
    color: white;
  }

  :deep(.q-separator) {
    background: rgba(255, 255, 255, 0.07);
  }

  :deep(.text-h6) {
    color: white;
  }

  :deep(.text-negative) {
    color: var(--q-negative) !important;
  }
}
</style> 
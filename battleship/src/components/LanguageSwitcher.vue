<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const { locale, setLocale } = useLocale()
</script>

<template>
  <div class="language-switcher">
    <button
      class="lang-btn"
      :class="{ active: locale === 'nl' }"
      @click="setLocale('nl')"
    >
      NL
    </button>
    <button
      class="lang-btn"
      :class="{ active: locale === 'en' }"
      @click="setLocale('en')"
    >
      EN
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: flex;
  gap: 0.25rem;
}

.lang-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.lang-btn:hover {
  background: #f0f0f0;
}

.lang-btn.active {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
  font-weight: 700;
}
</style>

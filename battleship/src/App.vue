<script setup lang="ts">
import LanguageSwitcher from './components/LanguageSwitcher.vue'
</script>

<template>
  <div class="app-shell">
    <div class="lang-bar">
      <LanguageSwitcher />
    </div>
    <RouterView />
  </div>
</template>

<style>
.app-shell {
  position: relative;
}

.lang-bar {
  position: fixed;
  top: 0.75rem;
  right: 1rem;
  z-index: 200;
}
</style>

<script setup lang="ts">
type TreeGridPageMode = 'view' | 'edit'

defineProps<{
  activeMode: TreeGridPageMode
}>()

const modeLinks = [
  {
    mode: 'view',
    label: 'Просмотр',
    to: { name: 'tree-grid' },
  },
  {
    mode: 'edit',
    label: 'Редактирование',
    to: { name: 'tree-grid-edit' },
  },
] as const
</script>

<template>
  <section class="table-page">
    <div class="table-shell">
      <nav class="mode-nav" aria-label="Режимы страницы">
        <RouterLink
          v-for="link in modeLinks"
          :key="link.mode"
          :to="link.to"
          class="mode-nav__link"
          :class="{ 'mode-nav__link--active': link.mode === activeMode }"
          :aria-current="link.mode === activeMode ? 'page' : undefined"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <slot name="header" />
      <slot />
    </div>
  </section>
</template>

<style scoped>
.table-page {
  min-height: 100vh;
  background: #f7f5f1;
  padding: 28px;
}

.table-shell {
  margin: 0 auto;
  max-width: 1120px;
}

.mode-nav {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 6px;
  border: 1px solid #d7d2c9;
  border-radius: 999px;
  background: #ffffff;
}

.mode-nav__link {
  border-radius: 999px;
  color: #5a5651;
  font-family: 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  padding: 10px 14px;
  text-decoration: none;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.mode-nav__link:hover {
  background: #edf4ff;
}

.mode-nav__link--active {
  background: #3f7ee8;
  color: #ffffff;
}

.mode-nav__link--active:hover {
  background: #3f7ee8;
}

@media (max-width: 840px) {
  .table-page {
    padding: 16px;
  }

  .mode-nav {
    display: flex;
  }
}
</style>

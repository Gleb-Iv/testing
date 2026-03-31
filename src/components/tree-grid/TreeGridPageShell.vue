<template>
  <section class="table-page">
    <div class="table-shell">
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

@media (max-width: 840px) {
  .table-page {
    padding: 16px;
  }
}
</style>

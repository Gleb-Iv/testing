import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/tree-grid',
    },
    {
      path: '/tree-grid',
      name: 'tree-grid',
      component: () => import('@/views/TreeGrid.vue'),
    },
    {
      path: '/tree-grid-edit',
      name: 'tree-grid-edit',
      component: () => import('@/views/TreeGridEdit.vue'),
    },
  ],
})

export default router

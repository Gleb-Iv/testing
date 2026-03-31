import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'

import TreeGridPageShell from '@/components/tree-grid/TreeGridPageShell.vue'

describe('TreeGridPageShell', () => {
  it('renders header and default slots inside the shared page shell', () => {
    const wrapper = mount(TreeGridPageShell, {
      slots: {
        header: '<header class="toolbar">Toolbar</header>',
        default: '<div class="grid-content">Grid content</div>',
      },
    })

    expect(wrapper.find('.table-page').exists()).toBe(true)
    expect(wrapper.find('.table-shell').exists()).toBe(true)
    expect(wrapper.find('.toolbar').text()).toBe('Toolbar')
    expect(wrapper.find('.grid-content').text()).toBe('Grid content')
  })
})

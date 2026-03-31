import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'

import TreeGridPageShell from '@/components/tree-grid/TreeGridPageShell.vue'

describe('TreeGridPageShell', () => {
  it('renders navigation with the active mode and shared shell slots', () => {
    const wrapper = mount(TreeGridPageShell, {
      props: {
        activeMode: 'view',
      },
      slots: {
        header: '<header class="toolbar">Toolbar</header>',
        default: '<div class="grid-content">Grid content</div>',
      },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.find('.table-page').exists()).toBe(true)
    expect(wrapper.find('.table-shell').exists()).toBe(true)
    expect(wrapper.find('.mode-nav').exists()).toBe(true)
    expect(wrapper.findAll('.mode-nav__link')).toHaveLength(2)
    expect(wrapper.find('.mode-nav__link--active').text()).toBe('Просмотр')
    expect(wrapper.find('.toolbar').text()).toBe('Toolbar')
    expect(wrapper.find('.grid-content').text()).toBe('Grid content')
  })
})

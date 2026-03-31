import { describe, it, expect } from 'vitest'

import { shallowMount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders router outlet', () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: {
          RouterView: true,
        },
      },
    })

    expect(wrapper.html()).toContain('router-view-stub')
  })
})

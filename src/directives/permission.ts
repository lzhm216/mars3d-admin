import type { Directive } from 'vue'
import { hasPermission } from '@/utils/permission'

export const permission: Directive = {
  mounted(el: HTMLElement, binding) {
    const { value } = binding
    if (value && !hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

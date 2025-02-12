<template>
  <div class="container">
    <n-tabs v-model:value="layout" type="segment" size="small">
      <n-tab-pane v-for="item in layoutOptions" :key="item.id" :name="item.id" :tab="item.name" />
    </n-tabs>
    <div class="pb-2">
      <n-button-group size="small">
        <n-button type="warning" @click="handleClear()">清空</n-button>
        <n-popover v-if="isSupported" :show="copied" placement="bottom" trigger="manual">
          <template #trigger>
            <n-button type="primary" :disabled="!total" @click="handleCopy()">
              {{ copied ? '复制成功' : '复制' }}
            </n-button>
          </template>
          <div class="whitespace-pre">{{ text }}</div>
        </n-popover>
      </n-button-group>
    </div>
    <div class="flex-[1] grid grid-cols-4 gap-1">
      <TransitionGroup name="list" appear>
        <n-input-number
          v-for="item in inputList"
          :key="item"
          :value="state[item]"
          :class="{ active: (state[item] || 0) > 0 }"
          :input-props="{ inputmode: 'decimal' }"
          :showButton="false"
          clearable
          placeholder="金额"
          size="small"
          @update:value="(v) => handleInput(item, v)">
          <template #prefix>{{ item }}:</template>
        </n-input-number>
      </TransitionGroup>
    </div>
    <div class="sticky bottom-0 z-10 pt-3 bg-white">
      <div>总金额: {{ fmtNumber(total) }} 元</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { omit } from 'lodash-es'
import { useClipboard, useLocalStorage } from '@vueuse/core'
import { NButton, NButtonGroup, NInputNumber, NPopover, NTabPane, NTabs } from 'naive-ui'

const year = new Date().getFullYear()
const offset = (year % 12) - 3
const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const layoutOptions = [
  { id: 'zodiac', name: '生肖' },
  { id: 'number', name: '数字' },
  { id: 'mixed', name: '混合' },
]
const zodiacAge = <Record<string, number[]>>{} /* [zodiac[0]]: [6, 18, 30, 42], */
const state = useLocalStorage('state', <Record<string, number | null>>{})
const layout = useLocalStorage('layout', layoutOptions[0].id)
const { text, copy, copied, isSupported } = useClipboard()
const inputList = computed(() => {
  const numArr = Array.from({ length: 49 }, (_, i) => String(i + 1))
  switch (layout.value) {
    case 'zodiac':
      return zodiac
    case 'number':
      return numArr
    case 'mixed':
    default:
      return [...zodiac, ...numArr]
  }
})
const total = computed(() => {
  const obj = omit<Record<string, number | null>>(state.value, zodiac)
  return Object.values(obj).reduce((a, b) => (a || 0) + (b || 0), 0) || 0
})

const fmtNumber = (value: number | null | undefined) => {
  return Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value || 0)
}

const handleInput = (key: string, value: number | null) => {
  state.value[key] = value
  if (key in zodiacAge) {
    zodiacAge[key].forEach((i) => (state.value[i] = value))
  }
}

const handleClear = () => {
  Object.keys(state.value).forEach((key) => {
    state.value[key] = null
  })
}

const handleCopy = () => {
  let text = Object.entries(omit<Record<string, number | null>>(state.value, zodiac))
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.padEnd(2, '\u00A0')}: ${fmtNumber(v)} 元`)
    .join('\n')
  if (text) {
    console.log(text)
    text += `\n总金额: ${fmtNumber(total.value)} 元`
    copy(text)
  }
}

onMounted(() => {
  zodiac.forEach((item, index) => {
    const n = offset - index
    zodiacAge[item] = [n - 12, n, n + 12, n + 24, n + 36, n + 48].filter((i) => i >= -5 && i <= 49)
  })
  console.table(zodiacAge)
})
</script>

<style lang="scss">
.container {
  padding: 12px 12px 0;
  &:after {
    content: '到底了...';
    display: block;
    padding: 12px 0 24px;
    text-align: center;
    color: var(--vt-c-divider-dark-1);
  }
}
.n-input-number {
  .n-input {
    --n-padding-left: 4px;
    --n-padding-right: 4px;
  }
  &.active {
    .n-input {
      --n-color: rgba(24, 160, 88, 0.32);
      --n-color-focus: rgba(24, 160, 88, 0.32);
    }
  }
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
}
.list-leave-active {
  position: absolute;
}
</style>

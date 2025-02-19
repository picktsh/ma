<template>
  <div class="container">
    <n-tabs v-model:value="pageTab" type="segment" size="small">
      <n-tab-pane v-for="item in pageTabOptsInit()" :key="item.id" :name="item.id" :tab="item.name" />
    </n-tabs>
    <div class="flex flex-wrap gap-1 pb-2">
      <n-popover trigger="click">
        <template #trigger>
          <n-button secondary>教程</n-button>
        </template>
        <ol class="list-decimal ps-4">
          <li>输入金额</li>
          <li>选择生肖或数字</li>
          <li>点击“暂存”</li>
          <li>重复1~3步骤, 直到完成填完金额</li>
          <li>点击“计算总和”</li>
          <li>点击“复制结果”</li>
        </ol>
      </n-popover>
      <n-button type="error" secondary @click="handleClearAll()">清空全部</n-button>
      <n-button class="flex-auto" secondary>关闭下拉</n-button>
    </div>
    <div class="flex flex-col gap-1 pb-2">
      <n-select
        :value="stateInput.amount"
        :input-props="{ inputmode: 'decimal' }"
        :options="quickAmount.map((i) => ({ value: i }))"
        :show-checkmark="false"
        :virtual-scroll="false"
        clearable
        filterable
        label-field="value"
        placeholder="输入金额"
        show-on-focus
        tag
        @focus="handleQuickAmount()"
        @update:value="(val) => (stateInput.amount = Number(val) || null)" />
      <n-select
        v-model:value="stateInput.zodiacs"
        :max-tag-count="6"
        :options="zodiacs.map((i) => ({ value: i }))"
        :show-checkmark="false"
        :virtual-scroll="false"
        clearable
        label-field="value"
        multiple
        placeholder="选择生肖" />
      <n-select
        v-model:value="stateInput.numbers"
        :input-props="{ inputmode: 'decimal' }"
        :max-tag-count="6"
        :options="numbersOptions"
        :show-checkmark="false"
        :virtual-scroll="false"
        label-field="value"
        multiple
        placeholder="选择数字" />
    </div>
    <div class="flex flex-wrap gap-1 pb-2">
      <n-button type="warning" secondary @click="resetInput()">清空输入</n-button>
      <n-button type="info" secondary @click="calcAccumulate()">暂存结果</n-button>
      <div class="flex-auto" />
      <n-button type="info" secondary @click="calcSum()">计算总和</n-button>
      <n-popover :show="copied" placement="bottom" trigger="manual">
        <template #trigger>
          <n-button type="primary" secondary :disabled="!isSupported && !total" @click="handleCopy()">
            {{ copied ? '复制成功' : '复制结果' }}{{ isSupported ? '' : '(未授权)' }}
          </n-button>
        </template>
        <div class="whitespace-pre">{{ text }}</div>
      </n-popover>
    </div>
    <div class="flex items-center flex-wrap gap-1 pb-2">
      <n-button
        v-for="(item, index) in resultRecord"
        :key="index"
        type="warning"
        secondary
        @click="handleViewResult(item.source)">
        {{ fmtNumber(item.source.amount) }}元:{{ fmtNumber(item.sum) }} 元
      </n-button>
    </div>
    <div class="flex-[1] grid grid-cols-4 gap-1">
      <TransitionGroup name="list" appear>
        <n-input-number
          v-for="item in inputList"
          :key="item"
          :class="{ active: Number(viewResult[item] || '0') > 0 }"
          :input-props="{ inputmode: 'decimal' }"
          :showButton="false"
          :value="viewResult[item] || null"
          clearable
          placeholder="金额"
          readonly
          size="small">
          <template #prefix>{{ item }}:</template>
        </n-input-number>
      </TransitionGroup>
    </div>
    <div class="sticky bottom-0 z-10 pt-3 bg-white">
      <div>合计金额: {{ fmtNumber(total) }} 元</div>
      <div v-if="viewTotal > 0">总计金额: {{ fmtNumber(viewTotal) }} 元</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cloneDeep, difference, filter, flatten, omit, sortBy, uniq, values } from 'lodash-es'
import { useClipboard, useLocalStorage, watchImmediate } from '@vueuse/core'
import { NButton, NInputNumber, NPopover, NSelect, NTabPane, NTabs } from 'naive-ui'
import {
  encodeData,
  numbers,
  numbersOptsInit,
  pageTabOptsInit,
  quickAmountInit,
  type ResultRecord,
  stateInputInit,
  zodiacAge,
  zodiacs,
} from './data.ts'

const { text, copy, copied, isSupported } = useClipboard()
const pageTab = useLocalStorage('pageTab', pageTabOptsInit()[0].id)
const stateInput = useLocalStorage('stateInput', stateInputInit())
const quickAmount = useLocalStorage('quickAmount', quickAmountInit())
const numbersOptions = useLocalStorage('numbersOptions', numbersOptsInit())
const viewResult = ref(<Record<string, number | null>>{})

const resultRecord = useLocalStorage('resultRecord', <ResultRecord>{})
const inputList = computed(() => {
  switch (pageTab.value) {
    case 'zodiac':
      return zodiacs
    case 'number':
      return numbers
    case 'mixed':
    default:
      return [...zodiacs, ...numbers]
  }
})

const viewTotal = computed(() => values(resultRecord.value).reduce((a, b) => a + b.sum, 0))

const total = computed(() => {
  const obj = omit<Record<string, number | null>>(viewResult.value, zodiacs)
  return Object.values(obj).reduce((a, b) => (a || 0) + (b || 0), 0) || 0
})

const handleQuickAmount = () => {
  const sufQa = <number[]>filter(uniq(sortBy(values(viewResult.value))), (i) => !!i && !quickAmountInit().includes(+i))
  quickAmount.value = quickAmountInit().concat(sufQa.slice(0, 7))
}

const fmtNumber = (value: number | null | undefined) => {
  return Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value || 0)
}

const handleViewResult = (source: ReturnType<typeof stateInputInit>) => {
  const result = <Record<string, number | null>>{}
  ;[...source.zodiacs, ...source.numbers].forEach((i) => (result[i] = source.amount))
  viewResult.value = result
}

const resetInput = () => (stateInput.value = stateInputInit())

const resetViewResult = () => (viewResult.value = {})

const handleClearAll = () => {
  resetInput()
  resetViewResult()
  resultRecord.value = {}
}

const handleCopy = () => {
  let text = Object.entries(omit<Record<string, number | null>>(viewResult.value, zodiacs))
    .filter(([, v]) => v)
    .map(([k, v]) => `${k.padEnd(2, '\u00A0')}: ${fmtNumber(v)} 元`)
    .join('\n')
  if (text) {
    text += `\n合计金额: ${fmtNumber(total.value)} 元`
    copy(text)
  }
}

const calcAccumulate = () => {
  if (!stateInput.value.amount) return
  const sum = stateInput.value.numbers.length * stateInput.value.amount
  const data = cloneDeep({ sum, source: stateInput.value })
  resultRecord.value[encodeData(data)] = data
  handleViewResult(stateInput.value)
  resetInput()
}

const calcSum = () => {
  const result = <Record<string, number | null>>{}
  values(resultRecord.value).forEach((item) => {
    item.source.zodiacs.forEach((i) => (result[i] = (result[i] || 0) + (item.source.amount || 0)))
    item.source.numbers.forEach((i) => (result[i] = (result[i] || 0) + (item.source.amount || 0)))
  })
  viewResult.value = result
}

watch(
  () => stateInput.value.zodiacs,
  (value, oldValue) => {
    const zodiacNumbersDel = flatten(oldValue?.map((i) => zodiacAge[i])).map(String)
    const zodiacNumbersAdd = flatten(value?.map((i) => zodiacAge[i])).map(String)
    stateInput.value.numbers = difference(stateInput.value.numbers, zodiacNumbersDel)
    stateInput.value.numbers = uniq([...stateInput.value.numbers, ...zodiacNumbersAdd])
    numbersOptions.value.forEach((i) => (i.disabled = zodiacNumbersAdd.includes(i.value)))
  },
  { immediate: true },
)
watchImmediate([() => stateInput.value.amount, () => stateInput.value.numbers], () =>
  handleViewResult(stateInput.value),
)
</script>

<style lang="scss">
.container {
  max-width: 768px;
  margin: 0 auto;
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

.n-base-select-menu.__internal-select-menu-m {
  --n-height: auto;
  .n-base-select-menu-option-wrapper {
    --n-option-color-active-pending: rgba(24, 160, 88, 0.32);
    --n-option-padding-left: 0;
    --n-option-padding-right: 0;
    --n-option-color-active: rgba(24, 160, 88, 0.32);
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.25rem;
    padding: 0.25rem;
    .n-base-select-option {
      justify-content: center;
      border: 1px solid #e5e7eb;
      border-radius: var(--n-border-radius);
      &::before {
        left: 0;
        right: 0;
      }
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

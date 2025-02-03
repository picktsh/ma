<template>
  <div class="sticky top-0 z-10 p-3" style="background: white">
    <div>总金额: {{ fmtNumber(total) }} 元</div>
  </div>
  <div class="container">
    <div class="flex gap-2">
      <div class="flex-1 flex flex-col gap-1">
        <n-input-number
          v-for="item in zodiac"
          :key="item"
          v-model:value="state[item]"
          clearable
          placeholder="金额"
          :showButton="false"
          :class="{ active: (state[item] || 0) > 0 }"
          :input-props="{ inputmode: 'decimal' }"
          @update:value="(v) => handleInput(String(item), v)">
          <template #prefix>{{ item }}:</template>
        </n-input-number>
      </div>
      <div class="flex-2 grid grid-cols-2 gap-1">
        <n-input-number
          v-for="item in 49"
          :key="item"
          v-model:value="state[item]"
          clearable
          placeholder="金额"
          :showButton="false"
          :class="{ active: (state[item] || 0) > 0 }"
          :input-props="{ inputmode: 'decimal' }">
          <template #prefix>{{ item }}:</template>
        </n-input-number>
      </div>
    </div>
    <!--TODO排列顺序是反过来的-->
    <!--    <div class="grid grid-flow-col grid-rows-12">-->
    <!--      <n-input-number-->
    <!--        v-for="item in zodiac"-->
    <!--        :key="item"-->
    <!--        v-model:value="state[item]"-->
    <!--        clearable-->
    <!--        placeholder="金额"-->
    <!--        :showButton="false"-->
    <!--        :class="{ active: (state[item] || 0) > 0 }"-->
    <!--        :input-props="{ inputmode: 'decimal' }"-->
    <!--        @update:value="(v) => handleInput(String(item), v)">-->
    <!--        <template #prefix>{{ item }}:</template>-->
    <!--      </n-input-number>-->
    <!--      <div v-for="item in offset - 1" :key="item" />-->
    <!--      <n-input-number-->
    <!--        v-for="item in 49"-->
    <!--        :key="item"-->
    <!--        v-model:value="state[item]"-->
    <!--        clearable-->
    <!--        placeholder="金额"-->
    <!--        :showButton="false"-->
    <!--        :class="{ active: (state[item] || 0) > 0 }"-->
    <!--        :input-props="{ inputmode: 'decimal' }">-->
    <!--        <template #prefix>{{ item }}:</template>-->
    <!--      </n-input-number>-->
    <!--    </div>-->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, toRaw } from 'vue'
import { omit } from 'lodash-es'
import { NInputNumber } from 'naive-ui'

const year = new Date().getFullYear()
const offset = (year % 12) - 3
const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const state = reactive<Record<string, number | null>>({})
const stateAge = reactive<Record<string, number[]>>({
  /* [zodiac[0]]: [6, 18, 30, 42], */
})

const total = computed(() => {
  const obj = omit<Record<string, number | null>>(state, zodiac)
  return Object.values(obj).reduce((a, b) => (a || 0) + (b || 0), 0) || 0
})

const fmtNumber = (value: number | null) => {
  return Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value || 0)
}

const handleInput = (key: string, value: number | null) => {
  if (key in stateAge) {
    stateAge[key].forEach((i) => (state[i] = value))
  } else {
    state[key] = value
  }
}

onMounted(() => {
  zodiac.forEach((item, index) => {
    const n = offset - index
    stateAge[item] = [n - 12, n, n + 12, n + 24, n + 36, n + 48].filter((i) => i >= 1 && i <= 49)
  })
  console.table(toRaw(stateAge))
})
</script>

<style lang="scss">
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.flex-2 {
  flex: 2;
}
.flex-3 {
  flex: 3;
}
.flex-col {
  flex-direction: column;
}
.grid {
  display: grid;
}
.grid-flow-row {
  grid-auto-flow: row;
}
.grid-flow-col {
  grid-auto-flow: column;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-rows-12 {
  grid-template-rows: repeat(12, minmax(0, 1fr));
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.p-3 {
  padding: 12px;
}
.py-3 {
  padding-top: 12px;
  padding-bottom: 12px;
}
.sticky {
  position: sticky;
}
.top-0 {
  top: 0;
}
.z-10 {
  z-index: 10;
}
.container {
  padding: 0 12px;
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
</style>

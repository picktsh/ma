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
          clearable
          placeholder="金额"
          v-model:value="state[item]"
          :showButton="false"
          @update:value="(v) => handleInput(String(item), v)">
          <template #prefix>
            {{ item }}
          </template>
        </n-input-number>
      </div>
      <div class="flex-2 grid grid-cols-2 gap-1">
        <n-input-number
          v-for="item in 49"
          :key="item"
          v-model:value="state[item]"
          clearable
          placeholder="金额"
          :showButton="false">
          <template #prefix>
            {{ item }}
          </template>
        </n-input-number>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, toRaw } from 'vue'
import { NInputNumber } from 'naive-ui'

const year = new Date().getFullYear()
const offset = (year % 12) - 3
const zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const state = reactive<Record<string, number | null>>({})
const stateAge = reactive<Record<string, number[]>>({
  /* [zodiac[0]]: [6, 18, 30, 42], */
})

const total = computed(() => {
  return Object.values(state).reduce((a, b) => (a || 0) + (b || 0), 0)
})

const fmtNumber = (value: number | null) => {
  return Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value || 0)
}

const handleInput = (key: string, value: number | null) => {
  if (key in stateAge) {
    console.log(key, stateAge[key])
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
.flex-col {
  flex-direction: column;
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
</style>

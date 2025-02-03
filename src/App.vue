<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" inline-theme-disabled>
    <TeMa/>
  </n-config-provider>
</template>

<script setup lang="ts">
import {NConfigProvider} from 'naive-ui'
import { zhCN, dateZhCN } from 'naive-ui'
import TeMa from "@/components/te-ma.vue";
</script>

<style scoped>

</style>

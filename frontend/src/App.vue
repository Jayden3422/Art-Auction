<template>
  <Suspense>
    <router-view/>
  </Suspense>
</template>

<script setup>
import * as echarts from 'echarts'
import { provide, onMounted } from 'vue'
import { setJsonLd, buildWebsiteJsonLd, buildOrganizationJsonLd } from './utils/seo'

provide('echarts', echarts)

onMounted(() => {
    setJsonLd([buildWebsiteJsonLd(), buildOrganizationJsonLd()])
})
</script>

<style>
</style>

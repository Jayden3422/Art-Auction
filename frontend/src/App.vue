<template>
  <a-config-provider :locale="antLocale">
    <Suspense>
      <router-view/>
    </Suspense>
  </a-config-provider>
</template>

<script setup>
import * as echarts from 'echarts'
import { provide, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { saveLocale, applyDocumentLang } from './utils/i18n'
import { setJsonLd, buildWebsiteJsonLd, buildOrganizationJsonLd } from './utils/seo'

provide('echarts', echarts)

const { locale } = useI18n()
const antLocale = computed(() => (locale.value === 'zh' ? zhCN : enUS))

watch(
    locale,
    (nextLocale) => {
        saveLocale(nextLocale)
        applyDocumentLang(nextLocale)
        dayjs.locale(nextLocale === 'zh' ? 'zh-cn' : 'en')
    },
    { immediate: true }
)

onMounted(() => {
    setJsonLd([buildWebsiteJsonLd(locale.value), buildOrganizationJsonLd(locale.value)])
})
</script>

<style>
</style>

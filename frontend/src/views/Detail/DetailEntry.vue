<template>
    <component :is="detailComponent" />
</template>

<script setup>
import { computed } from 'vue'
import Cookie from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import Detail from './Detail.vue'
import DetailS from './DetailS.vue'

const detailComponent = computed(() => {
    const token = Cookie.get('token')
    if (!token) {
        return Detail
    }
    try {
        const permission = Number(jwtDecode(token).Permission)
        return permission === 0 ? Detail : DetailS
    } catch (error) {
        return Detail
    }
})
</script>

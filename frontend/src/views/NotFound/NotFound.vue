<template>
    <div class="not-found">
        <h1>404</h1>
        <p>Page not found</p>
        <router-link to="/login">Go to Home</router-link>
    </div>
</template>

<script>
import { setMetaTag } from '../../utils/seo';
export default {
    setup() {
        document.title = '404 Not Found - Jayden Art Auction';
        setMetaTag('name', 'robots', 'noindex, nofollow');
    }
}
</script>

<style scoped>
.not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: sans-serif;
}
.not-found h1 {
    font-size: 6rem;
    margin: 0;
    color: #999;
}
.not-found p {
    font-size: 1.5rem;
    color: #666;
    margin: 16px 0;
}
.not-found a {
    color: #1890ff;
    font-size: 1rem;
}
</style>

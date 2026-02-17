import { createApp } from 'vue'
import Antd from 'ant-design-vue';
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css';
import { updateRouteMeta } from './utils/seo';
import Cookie from "js-cookie";
import { jwtDecode } from 'jwt-decode'
const api = require('./utils/api')
import en from './locales/en.js'
import zh from './locales/zh.js'

const i18n = createI18n({
    locale: 'en',
    messages: {
        en,
        zh
    }
})

const app = createApp(App);
app.use(i18n).use(store).use(router).use(Antd).mount('#app')

const PUBLIC_CONTENT_PATHS = new Set([
    '/home',
    '/home/auction',
    '/home/detail',
    '/home/details'
]);

function isPublicContentPath(pathname) {
    return PUBLIC_CONTENT_PATHS.has(pathname)
        || pathname.startsWith('/home/auction/')
        || pathname.startsWith('/home/detail/')
        || pathname.startsWith('/home/details/');
}

router.beforeEach(async (to, from, next) => {
    let loadingBar = document.getElementById('global-loading')
    if (!loadingBar) {
        loadingBar = document.createElement('div')
        loadingBar.id = 'global-loading'
        document.body.append(loadingBar)
    } else {
        loadingBar.style.display = 'block'
    }

    updateRouteMeta(to.meta, to.fullPath, to.path);

    if (to.path === '/home') {
        next({ name: 'auction' });
        return;
    }

    if (to.path === '/login') {
        const hasValidToken = await validateToken();
        if (hasValidToken) {
            next({ name: 'auction' });
            return;
        }
        next();
        return;
    }

    if (!to.meta.isAuth || isPublicContentPath(to.path)) {
        next();
        return;
    }

    const myToken = Cookie.get('token');
    if (!myToken) {
        next({ name: 'login' });
        return;
    }

    let myPids = [];
    try {
        myPids = jwtDecode(myToken).pids || [];
    } catch (e) {
        next({ name: 'login' });
        return;
    }

    if (!myPids.includes(to.meta.pid)) {
        alert('You do not have permission to access');
        next(from.path || '/home/auction');
        return;
    }

    const hasValidToken = await validateToken();
    if (hasValidToken) {
        next();
        return;
    }
    next({ name: 'login' });
})

async function validateToken() {
    try {
        const res = await api.postAPI('/all/isToken');
        if (res.status == 200) {
            store.commit('setUser', res.data);
            return true;
        }
    } catch (err) {
        console.log(err);
    }
    return false;
}

router.afterEach(() => {
    let loadingBar = document.getElementById('global-loading')
    if (loadingBar) {
        loadingBar.style.display = 'none'
    }
})

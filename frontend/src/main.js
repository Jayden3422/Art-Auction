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
// 导入语言文件
import en from './locales/en.js'
import zh from './locales/zh.js'
const i18n = createI18n({
    locale: 'en',  // 默认语言
    messages: {
        en,
        zh
    }
})

const app = createApp(App);
app.use(i18n).use(store).use(router).use(Antd).mount('#app')

var judge = false;

router.beforeEach((to, from, next) => {
    // loadingBar
    let loadingBar = document.getElementById('global-loading')
    if (!loadingBar) {
        loadingBar = document.createElement('div')
        loadingBar.id = 'global-loading'
        document.body.append(loadingBar)
    } else {
        loadingBar.style.display = 'block'
    }
    // SEO: dynamically update page meta tags, canonical URL, and hreflang
    updateRouteMeta(to.meta, to.fullPath, to.path);
    if (to.path == '/login') {
        isToken(next, '/login');
    } else if (to.meta.isAuth) {
        var myToken = Cookie.get('token');
        if (myToken) {
            // 解析token中的权限列表
            var myPids = jwtDecode(myToken).pids;
            if (myPids) {
                if (myPids.includes(to.meta.pid)) {
                    // pids有
                    if (to.path == '/home') {
                        if (myPids.includes(1)) {
                            next({ name: 'auction' });
                        } else {
                        }
                    }
                    isToken(next, 'none')
                } else {
                    // pids没有
                    alert("You do not have permission to access");
                    next(from.path);
                }
            }
        } else {
            isToken(next, '')
        }
    } else {
        next();// 如果不是以上情况直接进入界面
    }
})

async function isToken(next, str) {
    await api.postAPI('/all/isToken')
        .then((res) => {
            if (res.status == 200) {
                store.commit("setUser", res.data);
                judge = true;
            }
        }).catch((err) => {
            console.log(err);
        })
    if (str == '/login') {
        if (judge) {
            next({ name: 'home' });
            return;
        } else {
            next();
        }
    } else if (str == 'none') {
        next();
    } else {
        if (judge) {
            next();
        } else {
            next({ name: 'login' });
        }
    }
}


router.afterEach((to, from) => {
    // loadingBar
    let loadingBar = document.getElementById('global-loading')
    if (loadingBar) {
        loadingBar.style.display = 'none'
    }
})
<template>
    <div>
        <section class="forms-section">
            <h1 class="section-title">{{ $t('message.name') }}</h1>
            <div class="language-switch">
                <a-button size="small" @click="switchLanguage">{{ $t('message.switchLanguage') }}</a-button>
            </div>
            <div class="forms">
                <div class="form-wrapper is-active">
                    <button type="button" class="switcher switcher-login" @click="isAct = !isAct">
                        {{ $t('message.user') }}
                        <span class="underline"></span>
                    </button>
                    <form class="form form-login">
                        <fieldset>
                            <span>{{ $t('message.selectIdentity') }}: </span>
                            <div class="tabs">
                                <a-tabs v-model:activeKey="activeKey" centered>
                                    <a-tab-pane key="0" :tab="t('message.buyer')"></a-tab-pane>
                                    <a-tab-pane
                                        key="1"
                                        :tab="t('message.seller')"
                                        force-render
                                    ></a-tab-pane>
                                </a-tabs>
                            </div>
                            <a-form
                                :model="formState"
                                name="normal_login"
                                @finish="onFinish"
                                @finishFailed="onFinishFailed"
                            >
                                <a-form-item :label="t('message.email')">
                                    <a-input v-model:value="formState.mail">
                                        <template #prefix>
                                            <UserOutlined class="site-form-item-icon" />
                                        </template>
                                    </a-input>
                                </a-form-item>

                                <a-form-item :label="t('message.password')">
                                    <a-input-password
                                        v-model:value="formState.password"
                                    >
                                        <template #prefix>
                                            <LockOutlined class="site-form-item-icon" />
                                        </template>
                                    </a-input-password>
                                </a-form-item>

                                <div class="login-form-wrap">
                                    <a-form-item name="remember" no-style>
                                        <a-checkbox @change="isRemember()"
                                            >{{ $t('message.rememberFor15Days') }}</a-checkbox
                                        >
                                        <router-link to="/signin">{{ $t('message.register') }}</router-link>
                                    </a-form-item>
                                </div>
                                <a-form-item :wrapper-col="{ span: 14, offset: 8 }">
                                    <a-button
                                        :disabled="disabled"
                                        type="primary"
                                        html-type="submit"
                                    >
                                    {{ $t('message.login') }}
                                    </a-button>
                                </a-form-item>
                            </a-form>
                        </fieldset>
                    </form>
                </div>
                <div class="form-wrapper">
                    <button type="button" class="switcher switcher-signup" @click="isAct = !isAct">
                        {{ $t('message.administrator') }}
                        <span class="underline"></span>
                    </button>
                    <form class="form form-signup">
                        <fieldset>
                            <a-form
                                :model="formState"
                                name="normal_login"
                                @finish="onFinish"
                                @finishFailed="onFinishFailed"
                            >
                                <a-form-item :label="t('message.email')">
                                    <a-input v-model:value="formState.mail">
                                        <template #prefix>
                                            <UserOutlined class="site-form-item-icon" />
                                        </template>
                                    </a-input>
                                </a-form-item>

                                <a-form-item :label="t('message.password')">
                                    <a-input-password
                                        v-model:value="formState.password"
                                    >
                                        <template #prefix>
                                            <LockOutlined class="site-form-item-icon" />
                                        </template>
                                    </a-input-password>
                                </a-form-item>

                                <div class="login-form-wrap">
                                    <a-form-item name="remember" no-style>
                                        <a-checkbox @change="isRemember()"
                                            >{{ $t('message.rememberFor15Days') }}</a-checkbox
                                        >
                                    </a-form-item>
                                </div>
                                <a-form-item :wrapper-col="{ span: 14, offset: 8 }">
                                    <a-button
                                        :disabled="disabled"
                                        type="primary"
                                        html-type="submit"
                                    >
                                    {{ $t('message.login') }}
                                    </a-button>
                                </a-form-item>
                            </a-form>
                        </fieldset>
                    </form>
                </div>
            </div>
        </section>
    </div>
</template>
<script>
import { reactive, computed, ref, onMounted, nextTick } from "vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';
import Cookie from "js-cookie";
import router from "@/router";
import { useRoute } from 'vue-router';
import store from "@/store";
const api = require("../../utils/api");
import md5 from '../../components/md5';
import { useI18n } from 'vue-i18n';
import { saveLocale, applyDocumentLang } from '@/utils/i18n';
export default {
    components: {
        UserOutlined,
        LockOutlined,
    },
    setup() {
        const { locale, t } = useI18n();
        const route = useRoute();
        const switchLanguage = async () => {
            const nextLocale = locale.value === 'en' ? 'zh' : 'en';
            locale.value = nextLocale;
            saveLocale(nextLocale);
            applyDocumentLang(nextLocale);
            try {
                await router.replace({
                    path: route.path,
                    query: {
                        ...route.query,
                        lang: nextLocale,
                    },
                    hash: route.hash,
                });
            } catch (error) {
                // ignore duplicated navigation
            }
        };
        // 动画
        onMounted(() => {
            nextTick(() => {
                const switchers = [...document.querySelectorAll('.switcher')]
                switchers.forEach(item => {
                    item.addEventListener('click', function() {
                        switchers.forEach(item => item.parentElement.classList.remove('is-active'))
                        this.parentElement.classList.add('is-active')
                    })
                })
            });
        });
        // 滑块位置
        var isAct = ref(false);
        function doAct() {
            isAct.value = !isAct.value;
        }
        var remember = ref(false);
        const formState = reactive({
            mail: "",
            password: "",
        });
        // 是否免登录
        function isRemember() {
            remember.value = !remember.value;
        }
        const onFinish = (values) => {
            if (isAct.value) {
                // 管理员
                var userform = {
                    EMAIL: formState.mail,
                    ADMIN_PASS: formState.password
                };
                var form = {
                    md5: md5('', userform),
                    EMAIL: formState.mail
                }
                api.postAPI("/admin/login", form)
                    .then((res) => {
                        if (res.status == 200) {
                            store.commit("setUserFormLogin", [res.data.userForm, 2]);// 管理员权限为2
                            if (remember.value == true) {
                                Cookie.set("token", res.data.token, {
                                    expires: 15,
                                });
                            } else {
                                Cookie.set("token", res.data.token);
                            }
                            router.go(0);
                        } else {
                            message.error(t('message.invalidCredentials'));
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                // 用户
                if (activeKey.value == "0") {
                    // 买家
                    var userform = {
                        EMAIL: formState.mail,
                        USER_PASS: formState.password
                    };
                    var form = {
                        md5: md5('', userform),
                        EMAIL: formState.mail
                    }
                    api.postAPI("/buyr/login", form)
                        .then((res) => {
                            if (res.status == 200) {
                                store.commit("setUserFormLogin", [res.data.userForm, 0]);// 买家权限为0
                                if (remember.value == true) {
                                    Cookie.set("token", res.data.token, {
                                        expires: 15,
                                    });
                                } else {
                                    Cookie.set("token", res.data.token);
                                }
                                router.go(0);
                            } else {
                                message.error(t('message.invalidCredentials'));
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else {
                    // 卖家
                    var userform = {
                        EMAIL: formState.mail,
                        SELLER_PASS: formState.password
                    };
                    var form = {
                        md5: md5('', userform),
                        EMAIL: formState.mail
                    }
                    api.postAPI("/seller/login", form)
                        .then((res) => {
                            if (res.status == 200) {
                                store.commit("setUserFormLogin", [res.data.userForm, 1]);// 卖家权限为1
                                if (remember.value == true) {
                                    Cookie.set("token", res.data.token, {
                                        expires: 15,
                                    });
                                } else {
                                    Cookie.set("token", res.data.token);
                                }
                                router.go(0);
                            } else {
                                message.error(t('message.invalidCredentials'));
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            }
        };
        const onFinishFailed = (errorInfo) => {
            console.log("Failed:", errorInfo);
        };
        const disabled = computed(() => {
            return !(formState.mail && formState.password);
        });
        // 选择用户类型
        var activeKey = ref("0");
        return {
            isAct,
            doAct,
            activeKey,
            isRemember,
            formState,
            onFinish,
            onFinishFailed,
            disabled,
            switchLanguage,
            t
        };
    },
};
</script>

<style scoped>
@import url("./Login.css");
.language-switch {
    margin-bottom: 16px;
    text-align: center;
}
</style>

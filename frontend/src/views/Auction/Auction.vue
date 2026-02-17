<template>
    <div>
        <h1 class="pageTitle">Auction Listings</h1>
        <a-alert
            v-if="isErr"
            :message="t('message.dataFail')"
            type="error"
            show-icon
            id="msg"
        />
        <a-button
            type="primary"
            class="addBtn"
            v-if="!(permission.per == 0)"
            @click="addGood"
        >{{ $t('message.add') }}</a-button>
        <a-tabs v-model:activeKey="activeKey" @change="onTabChange">
            <a-tab-pane key="0" :tab="t('message.upAuction')">
                <Suspense>
                    <template v-slot:default>
                        <goods-list state="0" :permission="permission" @isErr="errInfo" />
                    </template>
                    <template v-slot:fallback>
                        <h3>{{ $t('message.wait') }}</h3>
                    </template>
                </Suspense>
            </a-tab-pane>
            <a-tab-pane key="1" :tab="t('message.onAuction')">
                <Suspense>
                    <template v-slot:default>
                        <goods-list state="1" :permission="permission" @isErr="errInfo" />
                    </template>
                    <template v-slot:fallback>
                        <h3>{{ $t('message.wait') }}</h3>
                    </template>
                </Suspense>
            </a-tab-pane>
            <a-tab-pane key="2" :tab="t('message.endAuction')">
                <Suspense>
                    <template v-slot:default>
                        <goods-list state="2" :permission="permission" @isErr="errInfo" />
                    </template>
                    <template v-slot:fallback>
                        <h3>{{ $t('message.wait') }}</h3>
                    </template>
                </Suspense>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<script>
import { reactive, ref } from "@vue/reactivity";
import GoodsList from "../../components/GoodsList/GoodsList.vue";
import { jwtDecode } from "jwt-decode";
import Cookie from 'js-cookie';
import store from '@/store';
import router from '@/router';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';
export default {
    components: {
        GoodsList,
    },
    setup() {
        const { t } = useI18n();

        // Auth-optional: anonymous users get buyer view (per=0)
        const token = Cookie.get('token');
        let decodedPermission = 0;
        let sellerId = '';
        if (token) {
            try {
                decodedPermission = jwtDecode(token).Permission;
                sellerId = store.state.userForm.SELLER_ID || '';
            } catch (e) {
                // Invalid token — treat as anonymous buyer
            }
        }
        var permission = reactive({
            per: decodedPermission,
            SELLER_ID: sellerId
        });
        // 弹窗
        var isErr = ref(false);
        function errInfo() {
            isErr.value = true;
            setTimeout(() => {
                isErr.value = false;
            }, 2000);
        }
        // tabs
        function resolveTabKeyByPath(pathname) {
            if (pathname.endsWith('/auction/live')) {
                return "1";
            }
            if (pathname.endsWith('/auction/ended')) {
                return "2";
            }
            return "0";
        }
        function resolvePathByTabKey(tabKey) {
            if (tabKey === "1") {
                return '/home/auction/live';
            }
            if (tabKey === "2") {
                return '/home/auction/ended';
            }
            return '/home/auction/upcoming';
        }
        var activeKey = ref(resolveTabKeyByPath(router.currentRoute.value.path || '/home/auction'));
        function onTabChange(tabKey) {
            const targetPath = resolvePathByTabKey(tabKey);
            if (router.currentRoute.value.path !== targetPath) {
                router.replace(targetPath).catch(() => {});
            }
        }
        watch(
            () => router.currentRoute.value.path,
            (pathname) => {
                const nextKey = resolveTabKeyByPath(pathname || '/home/auction');
                if (nextKey !== activeKey.value) {
                    activeKey.value = nextKey;
                }
            }
        );
        function addGood() {
            store.commit("addGood");
            store.commit("setGoodInfo", {});
            router.push({name: "goodinfo"})
        }
        return {
            addGood,
            permission,
            isErr,
            errInfo,
            activeKey,
            onTabChange,
            t
        };
    },
};
</script>

<style scoped>
@import url("./Auction.css");
</style>

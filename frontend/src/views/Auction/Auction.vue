<template>
    <div>
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
        <a-tabs v-model:activeKey="activeKey">
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
export default {
    components: {
        GoodsList,
    },
    setup() {
        const { t } = useI18n();
        var permission = reactive({
            per: jwtDecode(Cookie.get('token')).Permission,
            SELLER_ID: store.state.userForm.SELLER_ID
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
        var activeKey = ref("0");
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
            t
        };
    },
};
</script>

<style scoped>
@import url("./Auction.css");
</style>
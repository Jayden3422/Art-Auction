<template>
    <div class="search">
        <a-select
            v-model:value="value"
            style="width: 120px"
            @change="handleChange"
        >
            <a-select-option
                v-for="(item, index) in typeList"
                :value="index"
            >{{ localizeCategory(item) }}</a-select-option>
        </a-select>
        <div v-if="List.length" class="goodsList">
            <div v-for="(item, index) in List" class="card" @click="detail(index)">
                <img :src="item.IMG_URL" />
                <div class="content">
                    <div class="title">
                        <div class="tit">￥{{ item.UPSET_PRICE }}{{ $t('message.bidStarts') }}</div>
                        <div class="count">{{ $t('message.quantity') }}: {{ item.COUNT }}</div>
                    </div>
                    <div class="name">
                        {{ item.NAME }}
                    </div>
                    <div class="time">{{ timeList[index].START_TIME }} ~</div>
                    <div class="time">
                        {{ timeList[index].END_TIME }}
                    </div>
                    <div class="intro">
                        {{ item.INTRODUCTION }}
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <a-empty />
        </div>
    </div>
</template>

<script>
import { message } from 'ant-design-vue';
import { reactive, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { fullDate } from "../../components/date";
import { postAPI } from "../../utils/api";
import router from '@/router';
import { jwtDecode } from "jwt-decode";
import Cookie from 'js-cookie';
import { useI18n } from 'vue-i18n';
import { localizeCategoryLabel } from '@/utils/dictionaryI18n';
export default {
    setup() {
        const { t } = useI18n();
        var typeList = reactive([].slice.call(useStore().state.classList));
        var value = ref();
        var res = reactive({
            List: []
        });
        var permission = jwtDecode(Cookie.get('token'));
        const handleChange = val => {
            searchData();
        };
        var timeList = reactive([]);
        function searchData() {
            postAPI("/buyr/searchGoods", {CLASS: value.value}).then(result => {
                res.List = result.data;
                // 处理时间后的数组
                for (let i = 0; i < res.List.length; i++) {
                    timeList.push({
                        START_TIME: fullDate(res.List[i].START_TIME),
                        END_TIME: fullDate(res.List[i].END_TIME),
                    });
                }
            }).catch(e => {
                message.info(t('message.obtainFailed'));
            })
        }
        // 打开详情页
        function detail(index) {
            var form = res.List[index]
            var routeData;
            if(permission.Permission == 0) {
            // 买家进入拍卖页
                routeData = router.resolve({
                    path: `/home/detail/${form.GOOD_ID}`
                });
            }else {
            // 卖家和管理员进入详情页
                routeData = router.resolve({
                    path: `/home/detail/${form.GOOD_ID}`
                });
            }
            window.open(routeData.href, "_blank");
        }
        return {
            ...toRefs(res),
            timeList,
            typeList,
            localizeCategory: (label) => localizeCategoryLabel(label, t),
            handleChange,
            value,
            detail,
            t
        }
    }
}
</script>

<style scoped>
@import url("./Search.css");
</style>

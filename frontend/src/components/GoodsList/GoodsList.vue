<template>
    <div>
        <div v-if="List.length != 0" class="goodsList">
            <div v-for="(item, index) in List" :key="item.GOOD_ID || index" class="card" @click="detail(index)">
                <img :src="item.IMG_URL" :alt="item.NAME" loading="lazy" width="420" height="300" />
                <div class="content">
                    <div class="title">
                        <div class="tit">{{ $t('message.bidStarts') }}: &yen;{{ item.UPSET_PRICE }}</div>
                        <div class="count">{{ $t('message.quantity') }}: {{ item.COUNT }}</div>
                    </div>
                    <h3 class="name">
                        <a :href="getDetailHref(item)" @click.stop.prevent="openDetail(item)">{{ item.NAME }}</a>
                    </h3>
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
import { reactive } from "@vue/reactivity";
import { fullDate } from "../../components/date";
import { getAPI, postAPI } from "../../utils/api";
import router from "@/router";
import { useI18n } from "vue-i18n";
import { setJsonLd, buildItemListJsonLd } from "../../utils/seo";

export default {
    props: [
        "state",
        "permission"
    ],
    emits: ["isErr"],
    async setup(props, context) {
        const { t } = useI18n();
        let List = reactive([]);

        if (props.permission.per == 1) {
            const sellerForm = {
                UPLOADER_ID: props.permission.SELLER_ID
            };
            if (props.state == "0") {
                await postAPI("/seller/getAllNear", sellerForm).then((res) => {
                    if (res.status == 200) {
                        List = reactive(res.data);
                    } else {
                        context.emit("isErr");
                    }
                });
            } else if (props.state == "1") {
                await postAPI("/seller/getAllSale", sellerForm).then((res) => {
                    if (res.status == 200) {
                        List = reactive(res.data);
                    } else {
                        context.emit("isErr");
                    }
                });
            } else {
                await postAPI("/seller/getAllEnd", sellerForm).then((res) => {
                    if (res.status == 200) {
                        List = reactive(res.data);
                    } else {
                        context.emit("isErr");
                    }
                });
            }
        } else {
            if (props.state == "0") {
                await getAPI("/all/getAllNear").then((res) => {
                    if (res.status == 200) {
                        List = reactive(res.data);
                    } else {
                        context.emit("isErr");
                    }
                });
            } else if (props.state == "1") {
                await getAPI("/all/getAllSale").then((res) => {
                    if (res.status == 200) {
                        List = reactive(res.data);
                    } else {
                        context.emit("isErr");
                    }
                });
            } else {
                await getAPI("/all/getAllEnd").then((res) => {
                    if (res.status == 200) {
                        List = reactive(res.data);
                    } else {
                        context.emit("isErr");
                    }
                });
            }
        }

        if (List.length > 0) {
            setJsonLd(buildItemListJsonLd(List));
        }

        const timeList = reactive([]);
        for (let i = 0; i < List.length; i++) {
            timeList.push({
                START_TIME: fullDate(List[i].START_TIME),
                END_TIME: fullDate(List[i].END_TIME)
            });
        }

        function getDetailHref(form) {
            const routeData = router.resolve({
                path: `/home/detail/${form.GOOD_ID}`
            });
            return routeData.href;
        }

        function openDetail(form) {
            window.open(getDetailHref(form), "_blank");
        }

        function detail(index) {
            openDetail(List[index]);
        }

        return {
            List,
            timeList,
            detail,
            getDetailHref,
            openDetail,
            t
        };
    }
};
</script>

<style scoped>
@import url("./GoodsList.css");
</style>

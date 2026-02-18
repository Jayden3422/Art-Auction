<template>
    <a-spin :tip="t('message.loading')" :spinning="spinning">
        <div class="detail">
            <a-alert
                v-if="isErr"
                :message="t('message.dataFail')"
                type="error"
                show-icon
                id="msg"
            />
            <!-- 拍卖 -->
            <a-modal v-model:visible="visible" :title="t('message.bidPrice')" @ok="handleOk">
                <div v-if="data.res[0]">
                    <p>{{ $t('message.highestPrice') }}: <div class="nowPrice">￥{{data.res[0].PRICE}}</div></p>
                    <p v-if="info.STEP == 0">{{ $t('message.yourBid') }}: 
                        <a-input-number
                            v-model:value="postPrice.PRICE"
                            :min="data.res[0].PRICE"
                            :step="info.STEP"
                        />
                    </p>
                    <p v-else>
                        <a-button @click="btnP">{{ $t('message.raisePrice') }}￥{{info.STEP}}</a-button>
                    </p>
                </div>
                <div v-else>
                    <p>{{ $t('message.noneBid') }}</p>
                    <p>{{ $t('message.yourBid') }}: 
                        <a-input-number
                            v-model:value="postPrice.PRICE"
                            :min="info.UPSET_PRICE"
                            :step="info.STEP"
                        />
                    </p>
                </div>
            </a-modal>
            <div class="top">
                <img :src="info.IMG_URL" :alt="info.NAME" class="left" width="640" height="640" />
                <div class="right">
                    <h1 class="title">
                        {{ info.NAME }}
                    </h1>
                    <div class="time">
                        {{ time.START_TIME }} ~ {{ time.END_TIME }}
                    </div>
                    <div>
                        <a-tag color="green">{{ localizeCategory(typeList[info.CLASS]) }}</a-tag>
                        <a-tag color="blue" v-if="info.STEP">{{ $t('message.priceStep') }}￥{{info.STEP}}</a-tag>
                        <a-tag color="default">
                            <template #icon>
                                <audit-outlined />
                            </template>
                            {{ $t('message.CertificateNum') }}: {{ info.CERTIFICATE }}
                        </a-tag>
                    </div>
                    <div v-if="info.GOOD_STATE">
                        <div class="useTimer">
                            <a-tag color="red" class="tit">{{ $t('message.auctionEnded') }}</a-tag>
                            <div class="endPrice">
                                {{ $t('message.noneBought') }}
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="noStart">
                            <div class="useTimer" v-if="dif">
                                <a-tag color="green" class="tit">{{ $t('message.startCountdown') }}</a-tag>
                                <Timer
                                    :seconds="timer.seconds"
                                    :minutes="timer.minutes"
                                    :hours="timer.hours"
                                    :days="timer.days"
                                />
                            </div>
                        </div>
                        <div v-else>
                            <div class="useTimer" v-if="dif">
                                <a-tag color="orange" class="tit">{{ $t('message.endCountdown') }}</a-tag>
                                <Timer
                                    :seconds="timer.seconds"
                                    :minutes="timer.minutes"
                                    :hours="timer.hours"
                                    :days="timer.days"
                                />
                            </div>
                            <div class="useTimer" v-else>
                                <a-tag color="red" class="tit">{{ $t('message.auctionEnded') }}</a-tag>
                                <div class="endPrice" v-if="spinning">
                                    {{ $t('message.productSold') }}
                                </div>
                                <div class="endPrice" v-else>
                                    {{ $t('message.transactionPrice') }}: ￥{{ info.PRICE }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="info">
                        <h2 class="tit">{{ $t('message.bidStarts') }}: ￥{{ info.UPSET_PRICE }}</h2>
                        <div class="intro">
                            {{ info.INTRODUCTION }}
                        </div>
                        <div class="infoCon">
                            <div class="infoLeft">
                                <div class="txt">{{ $t('message.artist') }}: {{ info.ARTIST }}</div>
                                <div class="txt">{{ $t('message.uploader') }}: {{ info.UPLOADER_ID }}</div>
                                <div class="txt">{{ $t('message.uploadTime') }}: {{ time.UPLOAD_TIME }}</div>
                                <div class="txt">{{ $t('message.quantity') }}: {{ info.COUNT }}</div>
                                <div class="txt">{{ $t('message.productID') }}: {{ info.GOOD_ID }}</div>
                            </div>
                            <div class="infoRight">
                                <a-button
                                    type="primary"
                                    danger
                                    size="large"
                                    @click="showModal"
                                    v-if="dif"
                                >
                                {{ $t('message.bid') }}
                                </a-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bottom">
                <a-table
                    :columns="columns"
                    :data-source="data.res"
                    :pagination="{ pageSize: 50 }"
                    :scroll="{ y: 240 }"
                />
            </div>
        </div>
    </a-spin>
</template>

<script>
import { reactive, ref, toRefs, computed } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { useTimer } from "vue-timer-hook";
import { onMounted, watchEffect } from "@vue/runtime-core";
import { fullDate } from "../../components/date";
import { formatDate } from "../../components/day";
import Timer from "../../components/Timer/Timer.vue";
import router from "@/router";
import { getAPI, postAPI } from "../../utils/api";
import { useStore } from 'vuex';
import store from '@/store';
import { useWebSocket } from '../../ws/hooks';
import { message } from 'ant-design-vue';
import { AuditOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { localizeCategoryLabel } from '@/utils/dictionaryI18n';
import { setMetaTag, setJsonLd, buildAuctionJsonLd, buildBreadcrumbJsonLd } from '../../utils/seo';
export default {
    components: {
        Timer,
        AuditOutlined
    },
    async setup() {
        const { t } = useI18n();
        var typeList = reactive([].slice.call(useStore().state.classList));
        const route = useRoute();
        var goodID = route.params.id || route.query.GOOD_ID;
        var List = reactive({
            info: {}
        });
        const getInfo = async () => {
            var result = await getAPI(`/all/getGood/${parseInt(goodID)}`);
            if (result.status == 200) {
                List.info = result.data;
            } else {
                isErr.value = true;
                setTimeout(() => {
                    isErr.value = false;
                }, 2000);
            }
        }
        await getInfo();
        // SEO: dynamically set item page meta and structured data
        if (List.info.NAME) {
            const seoTitle = `${List.info.NAME} - Jayden Art Auction`;
            document.title = seoTitle;
            setMetaTag('name', 'description', `${List.info.NAME} - ${List.info.INTRODUCTION || ''}. Artist: ${List.info.ARTIST || 'Unknown'}, Starting price: ￥${List.info.UPSET_PRICE || 0}`);
            setMetaTag('property', 'og:title', seoTitle);
            setMetaTag('property', 'og:description', List.info.INTRODUCTION || '');
            setMetaTag('property', 'og:image', List.info.IMG_URL || '');
            setMetaTag('property', 'og:type', 'product');
            setJsonLd([
                buildAuctionJsonLd(List.info),
                buildBreadcrumbJsonLd([
                    { name: t('message.home'), path: '/home/auction' },
                    { name: t('message.auctionListings'), path: '/home/auction' },
                    { name: List.info.NAME, path: `/home/detail/${List.info.GOOD_ID}` }
                ])
            ]);
        }
        var time = reactive({
            START_TIME: fullDate(List.info.START_TIME),
            END_TIME: fullDate(List.info.END_TIME),
            UPLOAD_TIME: fullDate(List.info.UPLOAD_TIME),
        });
        // 成交价
        var isDone = ref(false);
        if (new Date(List.info.END_TIME) < now) {
            isDone.value = true;
        }
        // 时间相关的计算
        var now = new Date();
        var dif = ref(0);
        var noStart = ref(false);
        var isEnd = ref(true);
        function startTimer() {
            dif.value = (new Date(List.info.END_TIME) - now) / 1000;
            if (dif.value < 0) {
                dif.value = 0;
                isEnd.value = true;
            }else if(dif.value > 0) {
                isEnd.value = false;
            }
        }
        function notStart() {
            noStart.value = true;
            dif.value =
                (new Date(List.info.START_TIME).valueOf() - now.valueOf()) / 1000;
        }
        if (new Date(List.info.START_TIME) < now) {
            if (new Date(List.info.END_TIME) > now) {
                // 开始但是未结束
                startTimer();
            }
        } else {
            // 未开始
            notStart();
        }
        var timer;
        // 倒计时
        function init() {
            const time = new Date();
            time.setSeconds(now.getSeconds() + dif.value); // 时间差
            timer = useTimer(time);
        }
        init();
        var spinning = ref(false);
        watchEffect(() => {
            if (timer.isExpired.value) {
                dif.value = 0;
                // 如果没开始到开始
                if (noStart.value == true) {
                    setTimeout(() => {
                        router.go(0);
                    }, 2000);
                }
                if(!isEnd.value) {
                    spinning.value = true;
                    setTimeout(() => {
                        router.go(0);
                    }, 2000);
                }
            }
        });
        // 表格
        const columns = computed(() => [
            {
                title: t('message.userID'),
                dataIndex: "INFO_ID",
                width: 150,
            },
            {
                title: t('message.bidderID'),
                dataIndex: "BUYR_ID",
                width: 150,
            },
            {
                title: `${t('message.bidPrice')}￥`,
                dataIndex: "PRICE",
                width: 150,
            },
            {
                title: t('message.time'),
                customRender: ({ record }) =>
                    formatDate(new Date(record.TIME).valueOf()),
            },
        ]);
        const data = reactive({
            res: [],
        });
        var isErr = ref(false);
        const getData = async () => {
            const result = await getAPI(`/all/getPriceList/${goodID}`);
            if (result.status == 200) {
                data.res = result.data;
            } else {
                isErr.value = true;
                setTimeout(() => {
                    isErr.value = false;
                }, 2000);
            }
        };
        getData();
        // 拍卖
        const visible = ref(false);
        const showModal = () => {
            visible.value = true;
        };
        // websocket
        const ws = useWebSocket(handleMessage);
        // 发送信息的函数
        function handleMessage (e) {
            const _msgData = JSON.parse(e.data);
            // 对后端返回值_msgData的处理
            data.res.unshift(_msgData);
        }
        function postP(){
            postAPI('/buyr/postPrice', postPrice).then(res => {
                if(res.status == 200) {
                    message.success(t('message.bidSuc'));
                    // 向后端发送信息
                    ws.send(JSON.stringify(res.data));
                }
            })
        }
        function btnP(){
            if(isRepetition()) {
                alert(t('message.donotRepeatedBid'));
            }else {
                visible.value = false;
                let postPrice = {
                    PRICE: parseFloat(data.res[0].PRICE) + parseFloat(List.info.STEP),
                    BUYR_ID: store.state.userForm.USER_ID,
                    GOOD_ID: goodID,
                };
                postAPI('/buyr/postPrice', postPrice).then(res => {
                    if(res.status == 200) {
                        message.success(t('message.bidSuc'));
                        // 向后端发送信息
                        ws.send(JSON.stringify(res.data));
                    }
                })
            }
        }
        function isRepetition() {
            return data.res[0]? data.res[0].BUYR_ID == store.state.userForm.USER_ID : false
        }
        const handleOk = () => {
            if(isRepetition()) {
                alert(t('message.donotRepeatedBid'));
            }else {
                if(data.res[0]){
                    if(postPrice.PRICE > data.res[0].PRICE){
                        visible.value = false;
                        postP();
                    }else {
                        alert(t('message.cannotLower'))
                    }
                }else {
                    if(postPrice.PRICE >= List.info.UPSET_PRICE){
                        visible.value = false;
                        postP();
                    }else {
                        alert(t('message.cannotLowerStart'))
                    }
                }
            }
        };
        // 竞拍
        var postPrice = reactive({
            PRICE: 0.00,
            BUYR_ID: store.state.userForm.USER_ID,
            GOOD_ID: goodID,
        })
        return {
            typeList,
            localizeCategory: (label) => localizeCategoryLabel(label, t),
            isErr,
            ...toRefs(List),
            time,
            // 倒计时
            timer,
            dif,
            noStart,
            // 加载中
            spinning,
            // 成交
            isDone,
            // 表格
            data,
            columns,
            // 拍卖
            visible,
            showModal,
            handleOk,
            postPrice,
            btnP,
            t
        };
    },
};
</script>

<style scoped>
@import url("./Detail.css");
</style>

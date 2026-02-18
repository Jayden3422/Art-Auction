<template>
    <div class="btns">
        <a-button type="primary" size="large" @click="back">{{ $t('message.return') }}</a-button>
        <a-button type="primary" danger size="large" @click="del" v-if="!isAddGood">{{ $t('message.del') }}</a-button>
    </div>
    <div class="signin">
        <a-form
            ref="formRef"
            name="custom-validation"
            :model="formState"
            :rules="rules"
            v-bind="layout"
            @finish="handleFinish"
            @validate="handleValidate"
            @finishFailed="handleFinishFailed"
        >
            <a-form-item
                :label="t('message.productName')"
                name="NAME"
                :rules="[{ required: true, message: t('message.enterProductName') }]"
            >
                <a-input v-model:value="formState.NAME" />
            </a-form-item>
            <a-form-item
                :label="t('message.quantity')"
                name="COUNT"
                :rules="[{ required: true, message: t('message.enterQuantity') }]"
            >
                <a-input-number v-model:value="formState.COUNT"/>
            </a-form-item>
            <a-form-item
                :label="t('message.class')"
                name="CLASS"
                :rules="[{ required: true, message: t('message.enterClass') }]"
            >
                <a-select
                    v-model:value="formState.CLASS"
                    style="width: 120px"
                >
                    <a-select-option
                        v-for="(item, index) in typeList"
                        :value="index"
                    >{{ localizeCategory(item) }}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item
                :label="t('message.artist')"
                name="ARTIST"
            >
                <a-input v-model:value="formState.ARTIST" />
            </a-form-item>
            <a-form-item
                :label="t('message.CertificateNum')"
                name="CERTIFICATE"
            >
                <a-input v-model:value="formState.CERTIFICATE" />
            </a-form-item>
            <a-form-item
                :label="t('message.startingPrice')"
                name="UPSET_PRICE"
                :rules="[{ required: true, message: t('message.enterStartingPrice') }]"
            >
                <a-input-number v-model:value="formState.UPSET_PRICE" step="0.01"/>
            </a-form-item>
            <a-form-item
                :label="t('message.priceStep')"
                name="STEP"
            >
                <a-input-number v-model:value="formState.STEP" step="0.01"/>
            </a-form-item>
            <a-form-item
                :label="t('message.auctionStartTime')"
                name="START_TIME"
                :rules="[{ required: true, message: t('message.selectStartTime') }]"
            >
                <a-date-picker v-model:value="formState.START_TIME" showTime />
            </a-form-item>
            <a-form-item
                :label="t('message.auctionEndTime')"
                name="END_TIME"
                :rules="[{ required: true, message: t('message.selectEndTime') }]"
            >
                <a-date-picker v-model:value="formState.END_TIME" showTime />
            </a-form-item>
            <a-form-item :label="t('message.picture')">
                <a-upload
                    v-model:file-list="fileList"
                    name="file"
                    :action="uploadFile"
                    :headers="headers"
                    @change="handleChange"
                    @remove="removeFile"
                >
                    <a-button>
                        {{ $t('message.uploadImage') }}
                    </a-button>
                </a-upload>
            </a-form-item>
            <a-form-item
                :label="t('message.introduction')"
                name="INTRODUCTION"
            >
                <a-textarea v-model:value="formState.INTRODUCTION" />
            </a-form-item>
            <a-form-item has-feedback :label="t('message.verification')" name="age">
                <a-input-number v-model:value="formState.age" />
                <div @click="refreshCode" style="cursor: pointer">
                    <Identify v-model:identifyCode="identifyCode"></Identify>
                </div>
            </a-form-item>
            <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                <a-button type="primary" html-type="submit" v-if="!isAddGood">{{ $t('message.renew') }}</a-button>
                <a-button type="primary" html-type="submit" v-else>{{ $t('message.add') }}</a-button>
                <a-button style="margin-left: 10px" @click="resetForm">
                    {{ $t('message.reset') }}
                </a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { defineComponent, reactive, ref } from "vue";
import Identify from "../../components/Identify.vue";
import { postAPI } from "../../utils/api";
import router from "@/router";
import store from "@/store";
import { useStore } from 'vuex';
import dayjs from 'dayjs';
import Cookie from "js-cookie";
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { localizeCategoryLabel } from '@/utils/dictionaryI18n';
export default defineComponent({
    components: {
        Identify,
    },
    setup() {
        const { t } = useI18n();
        var typeList = reactive([].slice.call(useStore().state.classList));
        // 是否为添加商品
        var isAddGood = ref(store.state.isAddGood);
        const formRef = ref();
        var formState = reactive();
        if(!isAddGood.value){
            formState = reactive({
                GOOD_ID: store.state.goodInfo.GOOD_ID,
                NAME: store.state.goodInfo.NAME,
                ARTIST: store.state.goodInfo.ARTIST,
                CERTIFICATE: store.state.goodInfo.CERTIFICATE,
                UPSET_PRICE: store.state.goodInfo.UPSET_PRICE,
                COUNT: store.state.goodInfo.COUNT,
                STEP: store.state.goodInfo.STEP,
                CLASS: store.state.goodInfo.CLASS,
                START_TIME: store.state.goodInfo.START_TIME,
                END_TIME: store.state.goodInfo.END_TIME,
                INTRODUCTION: store.state.goodInfo.INTRODUCTION,
                IMG_URL: store.state.goodInfo.IMG_URL,
                IMG_PATH: store.state.goodInfo.IMG_PATH,
                GOOD_STATE: store.state.goodInfo.GOOD_STATE,
                UPLOADER_ID: store.state.userForm.SELLER_ID
            });
            formState.START_TIME = dayjs(formState.START_TIME, 'YYYY-MM-DD HH:mm:ss')
            formState.END_TIME = dayjs(formState.END_TIME, 'YYYY-MM-DD HH:mm:ss')
        }else {
            formState = reactive({
                NAME: "",
                ARTIST: "",
                CERTIFICATE: "",
                UPSET_PRICE: null,
                COUNT: null,
                START_TIME: null,
                END_TIME: null,
                INTRODUCTION: "",
                IMG_URL: "",
                IMG_PATH: "",
                CLASS: "",
                GOOD_STATE: 0,
                STEP: 0,
                UPLOADER_ID: store.state.userForm.SELLER_ID
            });
        }
        let checkAge = async (_rule, value) => {
            if (!value) {
                return Promise.reject(t('message.enterVerification'));
            }
            if (!Number.isInteger(value)) {
                return Promise.reject(t('message.enterNumber'));
            }
            if (value != identifyCode.value) {
                return Promise.reject(t('message.enterRightVerification'));
            } else {
                return Promise.resolve();
            }
        };
        const rules = {
            age: [
                {
                    validator: checkAge,
                    trigger: "change",
                },
            ],
        };
        const layout = {
            labelCol: {
                span: 4,
            },
            wrapperCol: {
                span: 14,
            },
        };
        // 通知标签
        var isErr = ref(false);
        var info = ref(false);
        const handleFinish = (values) => {
            // 文件
            if(fileList.value.length) {
                formState.IMG_URL = fileList.value[0].url;
                formState.IMG_PATH = fileList.value[0].path;
            }else {
            }
            if(isAddGood.value) {
                postAPI("/seller/addGood", formState).then((res) => {
                    if (res.status == 200) {
                        info.value = true;
                        setTimeout(() => {
                            router.back();
                        }, 2000);
                    } else {
                        message.info(t('message.submitFail'));
                    }
                });
            }else {
                postAPI("/seller/updateGood", formState).then((res) => {
                    if (res.status == 200) {
                        info.value = true;
                        setTimeout(() => {
                            router.back();
                        }, 2000);
                    } else {
                        message.info(t('message.submitFail'));
                    }
                });
            }
        };
        const handleFinishFailed = (errors) => {
            console.log(errors);
        };
        const resetForm = () => {
            formRef.value.resetFields();
        };
        // 文件列表
        var fileList = ref([]);
        if(formState.IMG_URL) {
            fileList.value = [
                {
                    uid: 0,
                    name: t('message.oldFiles'),
                    status: 'done',
                    // custom error message to show
                    url: formState.IMG_URL,
                    path: formState.IMG_PATH,
                    type: "image"
                }
            ]
        }
        // 上传文件
        var uploadFile = ref(store.state.uploadFile);
        async function delOld(path) {
            await postAPI("/delFile", {path: path}).then(res => {
                message.success(t('message.delFilesSuc'));
                router.go(0);
            }).catch(e => {
                message.info(t('message.delFilesFail'));
            });
        }
        const handleChange = async (info) => {
            if (info.file.status !== 'uploading') {
            }
            if (info.file.status === 'done') {
                if(info.fileList.length > 1) {
                    await delOld(info.fileList[0].path);
                    [info.fileList[0], info.fileList[1]] = [info.fileList[1], info.fileList[0]];
                    info.fileList.length = 1;
                }
                fileList.value = [
                    {
                        uid: info.fileList[0].uid,
                        name: info.fileList[0].name,
                        status: 'done',
                        // custom error message to show
                        url: info.fileList[0].response.url,
                        path: info.fileList[0].response.path,
                        type: info.fileList[0].type,
                    }
                ]
                message.success(`${info.file.name + t('message.uploadCompleted')}`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name + t('message.uploadFail')}`);
            }
        };
        async function removeFile(e) {
            await delOld(fileList.value[0].path);
            fileList.value = [];
        }
        // 验证码
        var identifyCode = reactive({
            value: "",
        });
        // 验证码规则
        var identifyCodes = "0123456789";
        // 切换验证码
        function refreshCode() {
            identifyCode.value = "";
            makeCode(4);
        }
        refreshCode();
        // 生成随机验证码
        function makeCode(l) {
            for (let i = 0; i < l; i++) {
                identifyCode.value +=
                    identifyCodes[
                        Math.floor(
                            Math.random() * (identifyCodes.length - 0) + 0
                        )
                    ];
            }
        }
        // 退回
        function back() {
            router.back()
        }
        // 删除
        function del() {
            postAPI('/seller/delGood', {
                GOOD_ID: formState.GOOD_ID
            }).then(res => {
                if (res.status == 200) {
                    info.value = true;
                    setTimeout(() => {
                        window.opener = null;
                        window.close()
                    }, 2000);
                } else {
                    isErr.value = true;
                    setTimeout(() => {
                        isErr.value = false;
                    }, 2000);
                }
            })
        }
        return {
            typeList,
            localizeCategory: (label) => localizeCategoryLabel(label, t),
            isAddGood,
            formState,
            formRef,
            rules,
            layout,
            handleFinishFailed,
            handleFinish,
            resetForm,
            isErr,
            info,
            // 上传文件
            uploadFile,
            fileList,
            headers: {
                token: Cookie.get('token'),
            },
            handleChange,
            removeFile,
            // 验证码
            identifyCode,
            identifyCodes,
            refreshCode,
            makeCode,
            back,
            del,
            t
        };
    },
});
</script>

<style scoped>
@import url("./GoodInfo.css");
</style>

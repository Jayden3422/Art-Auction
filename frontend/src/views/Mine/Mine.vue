<template>
    <a-alert v-if="isErr" :message="t('message.sendFail')" type="error" show-icon id="msg" />
    <a-alert v-if="info" :message="t('message.updateSuc')" type="success" show-icon id="msg" />
    <div class="mine">
        <div v-if="!isEdit">
            <div class="top">
                <img :src="userForm.AVATAR_URL" alt="" class="left" />
                <div class="right">
                    <div class="titley" v-if="per == 0">
                        {{ userForm.USER_NAME }}
                        <div class="tag">
                            {{ $t('message.overallScore') }}: <a-tag color="orange">{{
                                userForm.USER_SCORE
                            }}</a-tag>
                        </div>
                    </div>
                    <div class="titley" v-if="per == 1">
                        {{ userForm.SELLER_NAME }}
                        <div class="tag">
                            {{ $t('message.overallScore') }}: <a-tag color="orange">{{
                                userForm.SELLER_SCORE
                            }}</a-tag>
                        </div>
                    </div>
                    <div class="intro" v-if="per == 0">
                        {{ userForm.USER_INTRO }}
                    </div>
                    <div class="intro" v-if="per == 1">
                        {{ userForm.SELLER_INTRO }}
                    </div>
                </div>
            </div>
            <div class="info">
                <div>{{ $t('message.phoneNumber') }}: {{ userForm.PHONE }}</div>
                <div>{{ $t('message.email') }}: {{ userForm.EMAIL }}</div>
                <div>{{ $t('message.address') }}: {{ userForm.POSITION }}</div>
            </div>
            <a-button type="primary" size="large" @click="edit">{{ $t('message.edit') }}</a-button>
        </div>
        <div v-else>
            <a-button type="primary" size="large" @click="edit">{{ $t('message.return') }}</a-button>
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
                    :label="t('message.nickName')"
                    name="name"
                    :rules="[{ required: true, message: t('message.enterNickName') }]"
                >
                    <a-input v-model:value="formState.name" />
                </a-form-item>
                <a-form-item has-feedback :label="t('message.email')" name="email">
                    <a-input
                        v-model:value="formState.email"
                        type="email"
                        autocomplete="off"
                    />
                </a-form-item>
                <a-form-item has-feedback :label="t('message.phoneNumber')" name="phone">
                    <a-input
                        v-model:value="formState.phone"
                        type="phone"
                        autocomplete="off"
                    />
                </a-form-item>
                <a-form-item :label="t('message.address')" name="position">
                    <a-input
                        v-model:value="formState.position"
                        autocomplete="off"
                    />
                </a-form-item>
                <a-form-item :label="t('message.personalizedSignature')" name="intro">
                    <a-textarea
                        v-model:value="formState.intro"
                    />
                </a-form-item>
                <a-form-item has-feedback :label="t('message.password')" name="pass">
                    <a-input-password
                        v-model:value="formState.pass"
                        type="password"
                        autocomplete="off"
                    />
                </a-form-item>
                <a-form-item has-feedback :label="t('message.confirmPassword')" name="checkPass">
                    <a-input-password
                        v-model:value="formState.checkPass"
                        type="password"
                        autocomplete="off"
                    />
                </a-form-item>
                <a-form-item has-feedback :label="t('message.verification')" name="age">
                    <a-input-number v-model:value="formState.age" />
                    <div @click="refreshCode" style="cursor: pointer">
                        <Identify v-model:identifyCode="identifyCode"></Identify>
                    </div>
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
                    <a-button type="primary" html-type="submit">{{ $t('message.renew') }}</a-button>
                    <a-button style="margin-left: 10px" @click="resetForm">
                        {{ $t('message.reset') }}
                    </a-button>
                </a-form-item>
            </a-form>
        </div>
    </div>
</template>

<script>
import store from "@/store";
import { reactive, ref } from "@vue/reactivity";
import Identify from "../../components/Identify.vue";
import judge from "../../components/judge";
import { postAPI } from "../../utils/api";
import router from "@/router";
import { jwtDecode } from "jwt-decode";
import Cookie from 'js-cookie';
import { useI18n } from 'vue-i18n';
export default {
    components: {
        Identify,
    },
    setup() {
        const { t } = useI18n();
        var per = ref(jwtDecode(Cookie.get('token')).Permission);
        var userForm = reactive(store.state.userForm);
        var isEdit = ref(false);
        function edit() {
            isEdit.value = !isEdit.value;
        }
        // 编辑
        const formRef = ref();
        var formState = reactive({});
        if(per.value == 0) {
            formState = reactive({
                id: userForm.USER_ID,
                name: userForm.USER_NAME,
                email: userForm.EMAIL,
                phone: userForm.PHONE,
                pass: "",
                checkPass: "",
                position: userForm.POSITION,
                intro: userForm.USER_INTRO
            })
        }else if(per.value == 1) {
            formState = reactive({
                id: userForm.SELLER_ID,
                name: userForm.SELLER_NAME,
                email: userForm.EMAIL,
                phone: userForm.PHONE,
                pass: "",
                checkPass: "",
                position: userForm.POSITION,
                intro: userForm.SELLER_INTRO
            })
        }
        let validateEmail = async (_rule, value) => {
            if (!value) {
                return Promise.reject(t('message.enterEmail'));
            }
            if (!judge.isMail(value)) {
                return Promise.reject(t('message.enterRightEmail'));
            }
        };
        let validatePhone = async (_rule, value) => {
            if (!value) {
                return Promise.reject(t('message.enterPhoneNumber'));
            }
            if (!judge.isPhone(value)) {
                return Promise.reject(t('message.enterRightPhoneNumber'));
            }
        };
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
        let validatePass = async (_rule, value) => {
            if (value === "") {
                return Promise.reject(t('message.enterPassword'));
            } else {
                if (formState.checkPass !== "") {
                    formRef.value.validateFields("checkPass");
                }
                return Promise.resolve();
            }
        };
        let validatePass2 = async (_rule, value) => {
            if (value === "") {
                return Promise.reject(t('message.reenterPassword'));
            } else if (value !== formState.pass) {
                return Promise.reject(t('message.passwordsNotMatch'));
            } else {
                return Promise.resolve();
            }
        };
        const rules = {
            email: [
                {
                    required: true,
                    validator: validateEmail,
                    trigger: "change",
                },
            ],
            phone: [
                {
                    required: true,
                    validator: validatePhone,
                    trigger: "change",
                },
            ],
            pass: [
                {
                    required: true,
                    validator: validatePass,
                    trigger: "change",
                },
            ],
            checkPass: [
                {
                    validator: validatePass2,
                    trigger: "change",
                },
            ],
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
            if(per.value == 0) {
                postAPI("/buyr/updateInfo", formState).then((res) => {
                    if (res.status == 200) {
                        info.value = true;
                        setTimeout(() => {
                            router.go(0);
                        }, 2000);
                    } else {
                        isErr.value = true;
                        setTimeout(() => {
                            isErr.value = false;
                        }, 2000);
                    }
                });
            }else if(per.value == 1) {
                postAPI("/seller/updateInfo", formState).then((res) => {
                    if (res.status == 200) {
                        info.value = true;
                        setTimeout(() => {
                            router.go(0);
                        }, 2000);
                    } else {
                        isErr.value = true;
                        setTimeout(() => {
                            isErr.value = false;
                        }, 2000);
                    }
                });
            }
        }
        const handleFinishFailed = (errors) => {
            console.log(errors);
        };
        const resetForm = () => {
            formRef.value.resetFields();
        };
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
        return {
            per,
            userForm,
            edit,
            isEdit,
            // 编辑
            formState,
            formRef,
            rules,
            layout,
            handleFinishFailed,
            handleFinish,
            resetForm,
            isErr,
            info,
            // 验证码
            identifyCode,
            identifyCodes,
            refreshCode,
            makeCode,
            t
        };
    },
};
</script>

<style scoped>
@import url("./Mine.css");
</style>

<template>
  <a-alert v-if="info" :message="t('message.submitSuc')" type="success" show-icon id="msg"/>
  <a-modal
    v-model:visible="visible"
    title="Modal"
    :ok-text="t('message.confirm')"
    :cancel-text="t('message.cancel')"
    @ok="hideModal"
  >
    <p>{{ $t('message.sureDel') }}</p>
  </a-modal>
<a-table
  class="mainTable"
  :columns="columns"
  :data-source="data"
  :scroll="{ x:1700, y: 430 }"
>
  <template #img="{ record }">
    <img :src="record.AVATAR_URL" alt="" class="trashImg">
  </template>
  <template #edit="{ record }">
    <div class="href">
      <a @click="edit(record)">{{ $t('message.edit') }}</a>
    </div>
    <div class="href">
      <a @click="confirm(record)">{{ $t('message.del') }}</a>
    </div>
  </template>
</a-table>
</template>
<script>
import store from '@/store';
import { reactive, ref, createVNode, computed } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Modal } from 'ant-design-vue';
const api = require('../utils/api')
import { useI18n } from 'vue-i18n';
export default {
emits: ["run-parent","reload"],
async setup(props, context) {
  const { t } = useI18n();
  var data = reactive([])
  var info = ref(false)
  async function getData(){
    await api.getAPI('/admin/allUsers', '')
      .then(
        (res) => {
          data = reactive(res.data)
        }
      ).catch(
        (err) => {
          console.log(err)
        }
      )
  }
  await getData()
 // 确认栏
 const visible = ref(false);
  const showModal = () => {
    visible.value = true;
  };
  const hideModal = () => {
    visible.value = false;
  };

  const confirm = (record) => {
    Modal.confirm({
      title: t('message.confirm'),
      icon: createVNode(ExclamationCircleOutlined),
      content: t('message.deletingData'),
      okText: t('message.confirm'),
      cancelText: t('message.cancel'),
      onOk: () => {
        delData(record)
      }
    });
  };

  const columns = computed(() => [
    {
      title: t('message.serialNumber'),
      key: '0',
      width: 10,
      align: 'center',
      fixed: 'left',
      customRender: (text) => text.index + 1
    },
    {
      title: t('message.userID'),
      key: '1',
      dataIndex: 'USER_ID',
      width: 15,
      fixed: 'left',
    },
    {
      title: t('message.nickName'),
      key: '2',
      dataIndex: 'USER_NAME',
      width: 17,
    },
    {
      title: t('message.phoneNumber'),
      key: '3',
      dataIndex: 'PHONE',
      width: 17,
    },
    {
      title: t('message.email'),
      key: '4',
      dataIndex: 'EMAIL',
      width: 20,
    },
    {
      title: t('message.address'),
      key: '5',
      dataIndex: 'POSITION',
      width: 20,
    },
    {
      title: t('message.introduction'),
      key: '6',
      dataIndex: 'USER_INTRO',
      width: 20,
    },
    {
      title: t('message.password'),
      key: '5',
      dataIndex: 'USER_PASS',
      width: 20
    },
    {
      title: t('message.avatar'),
      key: '6',
      width: 20,
      slots: { customRender: 'img' },
    },
    {
      title: t('message.operate'),
      key: 'operation',
      width: 12,
      fixed: 'right',
      slots: { customRender: 'edit' },
    },
  ]);
  function edit(e){
    store.commit('isUpdateUser')
    store.commit('setUserForm', e)
    context.emit('run-parent', false)
  }
  function refresh(){
      location.reload();
  }
  async function delData(e){
    await api.deleteListAPI('/admin/delUser?' + e.USER_ID, '')
      .then(
        (res) => {
          if(res.status == 200){
            info.value = true
            setTimeout(() => {
              refresh()
            }, 1000)
          }
        }
      ).catch(
        (err) => {
          console.log(err)
        }
      )
  }
  return {
    // 提示
    visible,
    showModal,
    hideModal,
    confirm,
    edit,
    delData,
    data,
    columns,
    info,
    t
  };
},
};
</script>
<style scoped>
.mainTable{
}
.href{
  display: inline-block;
  margin-right: 15px;
}
#msg{
  margin: -110px auto;
  position: absolute;
  width: 80vw;
  z-index: 9;
}
.inline{
  display: inline-block!important;
  width: 30%;
}
.trashImg{
  width: 50px;
  height: 50px;
}
</style>

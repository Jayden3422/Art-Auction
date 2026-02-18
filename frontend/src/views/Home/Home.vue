<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <h1 class="srOnly">Jayden Art Auction</h1>
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo">
        <span>Jayden</span>
        {{collapsed? "" : "Art Auction"}}
      </div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <template v-if="routesList.length">
          <router-link v-for="(item, index) in routesList" :to="item.path" custom v-slot="{ navigate }">
            <a-menu-item :key="item.path" @click="navigate" @keypress.enter="navigate" role="link">
              <Icon :id="item.icon"/>
              <span>{{ item.titleKey ? t(item.titleKey) : item.title }}</span>
            </a-menu-item>
          </router-link>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <menu-unfold-outlined
          v-if="collapsed"
          class="trigger"
          @click="() => (collapsed = !collapsed)"
        />
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
        <a-button v-if="isLoggedIn" @click="out">{{ $t('message.loginOut') }}</a-button>
        <router-link v-else to="/login"><a-button type="primary">{{ $t('message.login') }}</a-button></router-link>
        <a-button @click="switchLanguage">{{ $t('message.switchLanguage') }}</a-button>
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <Suspense>
          <router-view></router-view>
        </Suspense>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import router from '@/router';
import { useRoute } from 'vue-router';
import Cookie from 'js-cookie';
import { defineComponent, reactive, ref, toRefs } from 'vue';
import Icon from "../../components/Icon.vue";
import { jwtDecode } from "jwt-decode";
import { getAPI } from '@/utils/api';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n'
import { saveLocale, applyDocumentLang } from '@/utils/i18n';
import { resolveMenuTitleKey } from '@/utils/dictionaryI18n';
export default defineComponent({
  components: {
    Icon,
    MenuUnfoldOutlined,
    MenuFoldOutlined
  },
  async setup() {
    const { locale, t } = useI18n();
    const store = useStore();
    const route = useRoute();

    // Auth-optional: gracefully handle missing token for anonymous users
    const token = Cookie.get('token');
    let pids = [];
    let isLoggedIn = false;
    if (token) {
      try {
        pids = jwtDecode(token).pids || [];
        isLoggedIn = true;
      } catch (e) {
        // Invalid token — treat as anonymous
      }
    }

    var list = reactive({
      routesList: []
    })

    function normalizeMenuItem(item) {
      const titleKey = resolveMenuTitleKey(item);
      if (!titleKey) return item;
      return {
        ...item,
        titleKey,
      };
    }
    // 退出登录
    const out = () => {
      Cookie.remove("token");
      router.go(0);
    }

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
    }
    try {
      const res = await getAPI("/all/getDics");
      store.commit("setClassList", JSON.parse(res.data[1].VALUE));
      if (isLoggedIn) {
        list.routesList = JSON.parse(res.data[0].VALUE)
          .filter(r => pids.includes(r.icon))
          .map(normalizeMenuItem);
      } else {
        // Anonymous users: show only auction listing
        list.routesList = [{ path: '/home/auction', titleKey: 'message.productInterface', icon: 1 }];
      }
    } catch (e) {
      // Fallback for anonymous or error
      list.routesList = [{ path: '/home/auction', titleKey: 'message.productInterface', icon: 1 }];
    }
    return {
      ...toRefs(list),
      out,
      isLoggedIn,
      selectedKeys: ref([router.currentRoute.value.matched[1]?.path || '/home/auction']),
      collapsed: ref(false),// 是否关闭侧边栏
      switchLanguage,
      t
    };
  },
});
</script>
<style scoped>
  @import url('./Home.css');
.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>

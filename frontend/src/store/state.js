export default {
    // 文件上传链接
    uploadFile: `${window.location.protocol}//${window.location.hostname}:${process.env.VUE_APP_APP_PORT || '3000'}/admin/uploadFile`,
    // 用户数据
    userForm: {},
    // 权限等级
    uid: 0,
    // 商品详情
    goodInfo: {},
    // 是否为添加商品
    isAddGood: false,
    // 其他管理员信息
    adminForm: {
      ADMIN_ID: "",
      ADMIN_NAME: "",
      AVATAR_URL: "",
      PHONE: "",
      ADMIN_PASS: "",
      PASS_SALT: "",
      ADMIN_STATUS: "",
      EMAIL: ""
    },
    // 是否添加管理员
    isAddAdmin: true,
    // 用户信息
    userInfo: {
        USER_ID: '',
        USER_NAME: "",
        EMAIL: "",
        USER_PASS: "",
        POSITION: "",
        USER_INTRO: "",
        AVATAR_URL: "",
        AVATAR_PATH: "",
        PHONE: "",
        PASS_SALT: "",
        USER_STATUS: 0,
        USER_SCORE: 10,
        TOTAL_COST_AMT: 0
    },
    // 是否添加买家
    isAddUser: true,
    // 卖家信息
    sellerForm: {
      SELLER_ID: "",
      SELLER_NAME: "",
      EMAIL: "",
      SELLER_PASS: "",
      POSITION: "",
      SELLER_INTRO: "",
      AVATAR_URL: "",
      AVATAR_PATH: "",
      PHONE: "",
      PASS_SALT: "",
      SELLER_STATUS: 0,
      SELLER_SCORE: 10,
      TOTAL_SELL_AMT: 0
    },
    // 是否添加卖家
    isAddSeller: true,
    // 种类列表
    classList: []
}

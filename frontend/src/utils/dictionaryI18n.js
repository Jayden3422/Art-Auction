function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

const MENU_KEY_BY_PATH = {
    '/home/auction': 'message.productInterface',
    '/home/search': 'message.productSearch',
    '/home/mine': 'message.personalInformation',
    '/home/order': 'message.orderManagementMenu',
    '/home/announce': 'message.notificationList',
    '/home/admins': 'message.administratorManagement',
    '/home/users': 'message.buyerManagement',
    '/home/sellers': 'message.sellerManagement',
    '/statistics': 'message.statisticsMenu'
};

const MENU_KEY_BY_TITLE = {
    'product interface': 'message.productInterface',
    'auction interface': 'message.productInterface',
    '商品界面': 'message.productInterface',
    '拍卖界面': 'message.productInterface',
    'product search': 'message.productSearch',
    '商品搜索': 'message.productSearch',
    'personal information': 'message.personalInformation',
    '个人信息': 'message.personalInformation',
    'order management': 'message.orderManagementMenu',
    '订单管理': 'message.orderManagementMenu',
    'notification list': 'message.notificationList',
    '通知列表': 'message.notificationList',
    'administrator management': 'message.administratorManagement',
    '管理员管理': 'message.administratorManagement',
    'buyer management': 'message.buyerManagement',
    '买家管理': 'message.buyerManagement',
    'seller management': 'message.sellerManagement',
    '卖家管理': 'message.sellerManagement',
    'statistics': 'message.statisticsMenu',
    '统计': 'message.statisticsMenu'
};

const CATEGORY_KEY_BY_TITLE = {
    'sculpture': 'message.sculpture',
    '雕塑': 'message.sculpture',
    'metal crafts': 'message.metalCrafts',
    '金属工艺品': 'message.metalCrafts',
    'strange stones': 'message.strangeStone',
    'strange stone': 'message.strangeStone',
    '奇石': 'message.strangeStone',
    'calligraphy and painting': 'message.paintingCalligraphy',
    'painting and calligraphy': 'message.paintingCalligraphy',
    '书画': 'message.paintingCalligraphy',
    'ceramics': 'message.ceramics',
    '陶瓷': 'message.ceramics'
};

export function resolveMenuTitleKey(item) {
    const path = normalizeText(item?.path);
    const title = normalizeText(item?.title);
    if (MENU_KEY_BY_PATH[path]) return MENU_KEY_BY_PATH[path];
    if (MENU_KEY_BY_TITLE[title]) return MENU_KEY_BY_TITLE[title];
    return item?.titleKey || '';
}

export function localizeCategoryLabel(label, t) {
    const key = CATEGORY_KEY_BY_TITLE[normalizeText(label)];
    if (!key) return label;
    return t(key);
}


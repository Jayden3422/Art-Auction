import { createRouter, createWebHistory } from 'vue-router'

function resolveCanonicalDetailId(routeLike) {
  const rawValue = routeLike?.params?.id ?? routeLike?.query?.GOOD_ID ?? routeLike?.query?.goodId ?? routeLike?.query?.id
  const goodId = Number(rawValue)
  if (!Number.isInteger(goodId) || goodId <= 0) {
    return null
  }
  return goodId
}

const routes = [
  {
    path: '',
    redirect: '/home'
  },
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/Login.vue'),
    meta: {
        title: "Login - Jayden Art Auction",
        description: "Log in to Jayden Art Auction to bid on paintings, ceramics, sculptures and more.",
        keywords: "art auction,online bidding,login,painting auction,ceramic auction",
        pid: -1
    }
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn/SignIn.vue'),
    meta: {
        title: "Sign Up - Jayden Art Auction",
        description: "Create your Jayden Art Auction account as a buyer or seller to participate in online art bidding.",
        keywords: "art auction sign up,register,buyer registration,seller registration",
        pid: -1
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/Home/Home.vue'),
    meta: {
        pid: 0
    },
    children: [
      {
        path: 'auction',
        name: 'auction',
        component: () => import('../views/Auction/Auction.vue'),
        meta: {
            title: {
                en: "Auction Listings - Jayden Art Auction",
                zh: "拍卖列表 - Jayden艺术品竞拍平台"
            },
            description: {
                en: "Browse all auction items including upcoming, live, and ended art auctions.",
                zh: "浏览全部拍卖商品，包括即将开始、进行中和已结束的拍卖。"
            },
            keywords: "auction listings,live auction,art bidding,paintings,ceramics,sculptures",
            pid: 1
        }
      },
      {
        path: 'auction/upcoming',
        name: 'auction-upcoming',
        component: () => import('../views/Auction/Auction.vue'),
        meta: {
            title: {
                en: "Upcoming Art Auctions - Jayden Art Auction",
                zh: "即将拍卖 - Jayden艺术品竞拍平台"
            },
            description: {
                en: "Preview upcoming art auctions before bidding starts.",
                zh: "查看即将开始的拍卖场次与艺术品。"
            },
            keywords: "upcoming auction,art lots preview,online bidding",
            pid: 1
        }
      },
      {
        path: 'auction/live',
        name: 'auction-live',
        component: () => import('../views/Auction/Auction.vue'),
        meta: {
            title: {
                en: "Live Art Auctions - Jayden Art Auction",
                zh: "正在拍卖 - Jayden艺术品竞拍平台"
            },
            description: {
                en: "Join live art auctions and place bids in real time.",
                zh: "参与实时竞拍并在线出价。"
            },
            keywords: "live auction,real-time bidding,art auction",
            pid: 1
        }
      },
      {
        path: 'auction/ended',
        name: 'auction-ended',
        component: () => import('../views/Auction/Auction.vue'),
        meta: {
            title: {
                en: "Ended Art Auctions - Jayden Art Auction",
                zh: "已结束拍卖 - Jayden艺术品竞拍平台"
            },
            description: {
                en: "Browse recently ended auctions and final results.",
                zh: "浏览近期结束的拍卖与成交结果。"
            },
            keywords: "ended auction,auction result,art auction history",
            pid: 1
        }
      },
      {
        path: 'detail/:id(\\d+)',
        name: 'detail',
        component: () => import('../views/Detail/DetailEntry.vue'),
        meta: {
            title: "Item Details - Jayden Art Auction",
            description: "View artwork details and place your bid online.",
            keywords: "auction item,art bidding,place bid",
            pid: 11
        }
      },
      {
        path: 'detail',
        redirect: (to) => {
            const goodId = resolveCanonicalDetailId(to)
            if (!goodId) {
                return { name: 'NotFound', params: { pathMatch: ['home', 'detail'] } }
            }
            return `/home/detail/${goodId}`
        }
      },
      {
        path: 'details/:id(\\d+)',
        redirect: (to) => `/home/detail/${to.params.id}`
      },
      {
        path: 'details',
        redirect: (to) => {
            const goodId = resolveCanonicalDetailId(to)
            if (!goodId) {
                return { name: 'NotFound', params: { pathMatch: ['home', 'details'] } }
            }
            return `/home/detail/${goodId}`
        }
      },
      {
        path: 'goodinfo',
        name: 'goodinfo',
        component: () => import('../views/Detail/GoodInfo.vue'),
        meta: {
            title: "Product Info - Jayden Art Auction",
            description: "Manage artwork product information.",
            keywords: "product info,artwork management",
            isAuth: true,
            pid: 13
        }
      },
      {
        path: 'mine',
        component: () => import('../views/Mine/Mine.vue'),
        meta: {
            title: "My Profile - Jayden Art Auction",
            description: "Manage your account information.",
            keywords: "profile,account management",
            isAuth: true,
            pid: 2
        }
      },
      {
        path: 'order',
        component: () => import('../views/Order/Order.vue'),
        meta: {
            title: "Order Management - Jayden Art Auction",
            description: "View and manage your auction orders.",
            keywords: "order management,auction orders,transaction history",
            isAuth: true,
            pid: 3
        }
      },
      {
        path: 'orderinfo',
        component: () => import('../views/Order/OrderInfo.vue'),
        meta: {
            title: "Order Details - Jayden Art Auction",
            description: "View auction order details.",
            keywords: "order details,transaction details",
            isAuth: true,
            pid: 31
        }
      },
      {
        path: 'orderinfos',
        component: () => import('../views/Order/OrderInfoS.vue'),
        meta: {
            title: "Order Details - Jayden Art Auction",
            description: "View auction order details.",
            keywords: "order details,transaction details",
            isAuth: true,
            pid: 32
        }
      },
      {
        path: 'announce',
        component: () => import('../views/Announce/Announce.vue'),
        meta: {
            title: "Announcements - Jayden Art Auction",
            description: "View the latest platform announcements and notifications.",
            keywords: "announcements,auction notifications",
            isAuth: true,
            pid: 4
        }
      },
      {
        path: 'addannounce',
        component: () => import('../views/Announce/AddAnnounce.vue'),
        meta: {
            title: "Announcement Management - Jayden Art Auction",
            description: "Create and edit platform announcements.",
            keywords: "announcement management,publish announcements",
            isAuth: true,
            pid: 41
        }
      },
      {
        path: 'search',
        component: () => import('../views/Search/Search.vue'),
        meta: {
            title: "Search - Jayden Art Auction",
            description: "Search for auction items.",
            keywords: "search,art search,find auction items",
            isAuth: true,
            pid: 5
        }
      },
      {
        path: 'admins',
        name: 'admins',
        component: () => import('../views/Admin/Admin.vue'),
        meta: {
            title: "Admin Management - Jayden Art Auction",
            description: "Manage platform administrator accounts.",
            keywords: "admin management,platform administration",
            isAuth: true,
            pid: 6
        }
      },
      {
        path: 'users',
        component: () => import('../views/Users/Users.vue'),
        meta: {
            title: "User Management - Jayden Art Auction",
            description: "Manage platform user accounts.",
            keywords: "user management,buyer management",
            isAuth: true,
            pid: 7
        }
      },
      {
        path: 'sellers',
        component: () => import('../views/Users/Sellers.vue'),
        meta: {
            title: "Seller Management - Jayden Art Auction",
            description: "Manage platform seller accounts.",
            keywords: "seller management,merchant management",
            isAuth: true,
            pid: 8
        }
      }
    ]
  },
  {
    path: '/statistics',
    component: () => import('../views/Statistics/Statistics.vue'),
    meta: {
        title: "Statistics - Jayden Art Auction",
        description: "View platform data statistics and analytics reports.",
        keywords: "statistics,auction data,platform analytics",
        isAuth: true,
        pid: 9
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound/NotFound.vue'),
    meta: {
        title: "404 Not Found - Jayden Art Auction",
        description: "The page you are looking for does not exist.",
        pid: -1
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

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
        isAuth: true,
        pid: 0
    },
    children: [
      {
        path: 'auction',
        name: 'auction',
        component: () => import('../views/Auction/Auction.vue'),
        meta: {
            title: "Auction Listings - Jayden Art Auction",
            description: "Browse all auction items including upcoming, live, and ended art auctions.",
            keywords: "auction listings,live auction,art bidding,paintings,ceramics,sculptures",
            isAuth: true,
            pid: 1
        }
      },
      {
        path: 'detail',
        component: () => import('../views/Detail/Detail.vue'),
        meta: {
            title: "Item Details - Jayden Art Auction",
            description: "View artwork details and place your bid online.",
            keywords: "auction item,art bidding,place bid",
            isAuth: true,
            pid: 11
        }
      },
      {
        path: 'details',
        component: () => import('../views/Detail/DetailS.vue'),
        meta: {
            title: "Product Details - Jayden Art Auction",
            description: "View product details and auction status.",
            keywords: "product details,auction status,seller management",
            isAuth: true,
            pid: 12
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

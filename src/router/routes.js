
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      {
        path: '/login',
        component: () => import('pages/Login'),
      },
      {
        path: '/home',
        component: () => import('pages/Home'),
        meta: { requiresAuth: true },
        alias: '/',
      },
      {
        path: '/historical',
        component: () => import('pages/Historical/Historical'),
        meta: { requiresAuth: true },
      },
      {
        path: '/house-view',
        component: () => import('pages/HouseView/HouseView'),
        meta: { requiresAuth: true },
      },
      {
        path: '/device',
        component: () => import('pages/device/Device'),
        meta: { requiresAuth: true },
      },
      {
        path: '/compare',
        component: () => import('pages/Compare/Compare'),
        meta: { requiresAuth: true },
      },
      {
        path: '/map',
        component: () => import('pages/Map/Map'),
        meta: { requiresAuth: true },
      },
      // Uncomment following to enable profile access
      // {
      //   path: '/profile',
      //   component: () => import('pages/Profile'),
      //   meta: { requiresAuth: true },
      // },
      {
        path: '/preference',
        component: () => import('pages/Preference'),
        meta: { requiresAuth: true },
      },
      {
        path: '/user-settings',
        component: () => import('pages/UserSettings/UserSettings'),
      },
      {
        path: '/contact-us',
        component: () => import('pages/ContactUs/ContactUs'),
        meta: { requiresAuth: true },
      },
      {
        path: '/whats-new',
        component: () => import('pages/whats-new/Home'),
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            component: () => import('pages/whats-new/List'),
            meta: { requiresAuth: true },
          },
          {
            path: 'new',
            component: () => import('pages/whats-new/New'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'edit',
            component: () => import('pages/whats-new/Edit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
        ],
      },
      {
        path: '/reset-password',
        component: () => import('pages/ResetPassword'),
      },
      {
        path: '/admin/user',
        component: () => import('pages/admin/user/Home'),
        meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
        children: [
          {
            path: '',
            component: () => import('pages/admin/user/List'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'edit',
            component: () => import('pages/admin/user/Edit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'new',
            component: () => import('pages/admin/user/New'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'delete',
            component: () => import('pages/admin/user/Delete'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
        ],
      },
      {
        path: '/admin/entity',
        component: () => import('pages/admin/entity/Home'),
        meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
        children: [
          {
            path: '',
            component: () => import('pages/admin/entity/List'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'edit',
            component: () => import('pages/admin/entity/Edit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'new',
            component: () => import('pages/admin/entity/New'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'delete',
            component: () => import('pages/admin/entity/Delete'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'user',
            component: () => import('pages/admin/entity/EntityUser'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'notification',
            component: () => import('pages/admin/entity/EditNotification'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
        ],
      },
      {
        path: '/admin/device',
        component: () => import('pages/admin/device/Home'),
        meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
        children: [
          {
            path: '',
            component: () => import('pages/admin/device/List'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'edit',
            component: () => import('pages/admin/device/Edit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'new',
            component: () => import('pages/admin/device/New'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'delete',
            component: () => import('pages/admin/device/Delete'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
        ],
      },
      {
        path: '/admin/report',
        component: () => import('pages/admin/report/Home'),
        meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
        children: [
          {
            path: '',
            component: () => import('pages/admin/report/List'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'edit',
            component: () => import('pages/admin/report/Edit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'new',
            component: () => import('pages/admin/report/New'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'delete',
            component: () => import('pages/admin/report/Delete'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'entity',
            component: () => import('pages/admin/report/Entity'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'email-list',
            component: () => import('pages/admin/report/EmailList'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'email-delete',
            component: () => import('pages/admin/report/EmailDelete'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'email-new',
            component: () => import('pages/admin/report/EmailNew'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'email-edit',
            component: () => import('pages/admin/report/EmailEdit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
        ],
      },
      {
        path: '/admin/poultry-curve',
        component: () => import('pages/admin/poultry-curve/Home'),
        meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
        children: [
          {
            path: '',
            component: () => import('pages/admin/poultry-curve/List'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'new',
            component: () => import('pages/admin/poultry-curve/New'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'edit',
            component: () => import('pages/admin/poultry-curve/Edit'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
          {
            path: 'delete',
            component: () => import('pages/admin/poultry-curve/Delete'),
            meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
          },
        ],
      },
      {
        path: '/admin/tags',
        component: () => import('pages/admin/tags/List'),
        meta: { requiresAuth: true, rolesRequired: ['Administrator'] },
      },
    ],
  },

  // Error 403 - Not found
  {
    path: '/403',
    component: () => import('pages/error/Error403'),
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/error/Error404'),
  },
];

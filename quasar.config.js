/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

import { configure } from 'quasar/wrappers'

export default configure(function (/* ctx */) {
  return {
    eslint: {
      warnings: true,
      errors: true
    },

    boot: [
      'axios'
    ],

    css: [
      'app.scss'
    ],

    extras: [
      'roboto-font',
      'material-icons'
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16'
      },
      vueRouterMode: 'hash'
    },

    devServer: {
      server: {
        type: 'http'
      },
      port: 9000,
      open: true
    },

    framework: {
      config: {},
      plugins: ['Notify'],
      components: [
        'QLayout',
        'QPageContainer',
        'QPage',
        'QHeader',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QBadge',
        'QAvatar',
        'QScrollArea',
        'QForm',
        'QInput',
        'QTooltip',
        'QSplitter',
        'QSpace',
        'QCard',
        'QCardSection',
        'QCardActions',
        'QDialog',
        'QMenu',
        'QSeparator',
        'QSpinner'
      ],
      iconSet: 'material-icons'
    },

    animations: []
  }
})

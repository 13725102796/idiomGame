// vue.config.js
const Path = require('path')
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
  // 设置代理
  devServer: {
    //   proxy: {
    //    '/hrm/api': {
    //       //target: 'http://192.168.1.209:10751/', // Dev环境
    //       //  target: 'http://192.168.1.238:10751/', // Test环境
    //       // target: 'http://192.168.1.215:10751/', // Rls环境
    //       target: 'http://192.168.1.218:10751/', // 正式环境
    //       changeOrigin: true,
    //       autoRewrite: true,
    //       cookieDomainRewrite: true,
    //       pathRewrite: {
    //         '^/hrm/api/': '/'
    //       }
    //     }
    //   }
  },
  // 其他选项...
  configureWebpack: {
    externals:{
      'vue': 'Vue',
      'vue-router': 'VueRouter',
      'vant': 'vant',
      'io': 'io'
    },
    resolve: {
      alias: {
        '@': Path.resolve(__dirname,'src/')
      }
    }
  }
}
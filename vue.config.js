module.exports = {
  publicPath: '',
  filenameHashing: false,
  productionSourceMap: false,
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    // Force polling to avoid fsevents issues on macOS with newer Node versions
    // This mitigates: TypeError: fsevents.watch is not a function
    watchOptions: {
      poll: 1000,
      ignored: /node_modules/
    },
    proxy: {
      '^/api': {
        target: 'https://storage.googleapis.com/suburbtrends-map-dev/',
        changeOrigin: true,
      }
    }
  },
  // Ensure webpack itself uses polling when watching files
  configureWebpack: {
    watchOptions: {
      poll: 1000,
      ignored: /node_modules/
    }
  },
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 25 * 1024 })) // assets 25KB or less will be inlined
  },
  pages: {
    index: {
      entry: 'src/pages/index/main.js',
      // source template
      template: 'public/index.html',
      // output in dist/
      filename: 'index.html',
      title: 'SuburbTrends',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    SuburbTrendsRentRabbit: {
      entry: 'src/pages/index/main.js',
      // source template
      template: 'public/SuburbTrendsRentRabbit.html',
      // output in dist/
      filename: 'SuburbTrendsRentRabbit.html',
      title: 'Rent Rabbit',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    SuburbTrendsJLL: {
      entry: 'src/pages/index/main.js',
      // source template
      template: 'public/SuburbTrendsJLL.html',
      // output in dist/
      filename: 'SuburbTrendsJLL.html',
      title: 'JLL',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    SuburbTrendsSuburbHelp: {
      entry: 'src/pages/index/main.js',
      // source template
      template: 'public/SuburbTrendsSuburbHelp.html',
      // output in dist/
      filename: 'SuburbTrendsSuburbHelp.html',
      title: 'Suburb Help',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    explorer: {
      entry: 'src/pages/explorer/main.js',
      // source template
      template: 'public/explorer.html',
      // output in dist/
      filename: 'explorer.html',
      title: 'SuburbTrends Explorer',
      chunks: ['chunk-vendors', 'chunk-common', 'explorer']
    },
    cashflow: {
      entry: 'src/pages/cashflow/main.js',
      // source template
      template: 'public/cashflow.html',
      // output in dist/
      filename: 'cashflow.html',
      title: 'SuburbTrends Cashflow Clusters',
      chunks: ['chunk-vendors', 'chunk-common', 'cashflow']
    }
  }
}

import { BigNumber } from 'bignumber.js';

BigNumber.config({
  DECIMAL_PLACES: 40,
  EXPONENTIAL_AT: [ -40, 40 ],
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  }
});

const isProduction = [ 'true', '1', '' ].includes('${MARKETPLACE_IS_PRODUCTION}');

export const environment = {
  production: isProduction,
  networkId: 1,
  networkName: 'Main Ethereum Network',
  intercomAppId: 'od9ohq7y',
  repux: {
    metaindexer: {
      protocol: '${MARKETPLACE_METAINDEXER_PROTOCOL}' || 'https',
      host: '${MARKETPLACE_METAINDEXER_HOST}' || 'localhost',
      port: '${MARKETPLACE_METAINDEXER_PORT}' || 9201,
      searchUrl: 'repux/_search'
    },
    pageSizeOptions: [ 10, 25, 50, 100 ],
    currency: {
      defaultName: 'REPUX',
      precision: 18,
      format: '1.0-18',
      pattern: /^\d*([,\.]\d{0,18})?$/
    },
    demoTokenContractAddress: '${MARKETPLACE_SC_TOKEN_ADDRESS}' || '0xbd83c21e6f0a9547abe908c6faa02a55512d57b4',
    registryContractAddress: '${MARKETPLACE_SC_REGISTRY_ADDRESS}' || '0xc2d327375dd73b132d1171aadf7a205d3a9b7d8f',
    categoriesListPath: '${MARKETPLACE_CATEGORIES_PATH}' || './assets/data-product-categories.json',
    maxDaysForDeliver: 14
  },
  ipfs: {
    host: '${MARKETPLACE_IPFS_HOST}' || 'localhost',
    port: '${MARKETPLACE_IPFS_PORT}' || '5002',
    protocol: '${MARKETPLACE_IPFS_PROTOCOL}' || 'https'
  },
  webPushServer: {
    host: '${WEBPUSH_SERVER_HOST}' || 'http://localhost:3000',
    publicKey: '${WEBPUSH_SERVER_PUBLIC_KEY}' || 'BHG0pFCWLmtfofYay5cGDhVkIDH-rJR6ntTH0EK8Kvj0LEh91O0LkufHxKA29ap7lDA-FH11KfEMyP39V8550cM'
  },
};

import { BigNumber } from 'bignumber.js';
import { EulaType } from 'repux-lib';

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
  analyticsCurrencySubstitute: 'USD',
  production: isProduction,
  networkId: 1,
  networkName: 'Main Ethereum Network',
  intercomAppId: '${MARKETPLACE_INTERCOM_APP_ID}' || 'od9ohq7y',
  gtmId: '${MARKETPLACE_GTM_ID}' || 'GTM-PG3BBGT',
  themeName: 'default-theme',
  maxNotificationsProductsNumber: 100,
  websocketServer: '${MARKETPLACE_WEBSOCKET_URL}' || 'https://localhost:3002',
  repux: {
    metaindexer: {
      protocol: '${MARKETPLACE_METAINDEXER_PROTOCOL}' || 'https',
      host: '${MARKETPLACE_METAINDEXER_HOST}' || 'localhost',
      port: '${MARKETPLACE_METAINDEXER_PORT}' || 9201
    },
    pageSizeOptions: [ 10, 25, 50, 100 ],
    currency: {
      defaultName: 'REPUX',
      precision: 18,
      format: '1.2-18',
      shortFormat: '1.2-4'
    },
    eulaUrls: [ {
      type: EulaType.STANDARD,
      url: '${MARKETPLACE_EULA_STANDARD}' || './assets/standard-eula_2018-07-23.txt',
    }, {
      type: EulaType.RESTRICTIVE,
      url: '${MARKETPLACE_EULA_RESTRICTIVE}' || './assets/restrictive-eula_2018-07-23.txt',
    }, {
      type: EulaType.OWNER
    } ],
    tokenContractAddress: '${MARKETPLACE_SC_TOKEN_ADDRESS}' || '0xbd83c21e6f0a9547abe908c6faa02a55512d57b4',
    registryContractAddress: '${MARKETPLACE_SC_REGISTRY_ADDRESS}' || '0x0fe6a11f60c62e8f2a1b2d6b0c12133e4616fe7a',
    categoriesListPath: '${MARKETPLACE_CATEGORIES_PATH}' || './assets/data-product-categories.json',
    maxDaysToDeliver: 14,
    defaultDaysToDeliver: 14,
    maxDaysToRate: 30,
    minProductRate: 1,
    maxProductRate: 5
  },
  ipfs: {
    host: '${MARKETPLACE_IPFS_HOST}' || 'localhost',
    port: '${MARKETPLACE_IPFS_PORT}' || '5002',
    protocol: '${MARKETPLACE_IPFS_PROTOCOL}' || 'https',
    maxFileSize: parseInt('${METAINDEXER_IPFS_MAX_FILE_SIZE}', 10) || 10_485_760
  },
  webPushServer: {
    host: '${WEBPUSH_SERVER_HOST}' || 'http://localhost:3000',
    publicKey: '${WEBPUSH_SERVER_PUBLIC_KEY}' || 'BHG0pFCWLmtfofYay5cGDhVkIDH-rJR6ntTH0EK8Kvj0LEh91O0LkufHxKA29ap7lDA-FH11KfEMyP39V8550cM'
  }
};

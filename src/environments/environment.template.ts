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
    demoTokenContractAddress: '${MARKETPLACE_SC_TOKEN_ADDRESS}' || '0x676c5a98879083e9276b58ea2a36e296a52bcbf8',
    registryContractAddress: '${MARKETPLACE_SC_REGISTRY_ADDRESS}' || '0x21e790519ff11e3fa036e25a761e5ca3a63887d4',
    categoriesListPath: '${MARKETPLACE_CATEGORIES_PATH}' || './assets/data-product-categories.json'
  },
  ipfs: {
    host: '${MARKETPLACE_IPFS_HOST}' || 'localhost',
    port: '${MARKETPLACE_IPFS_PORT}' || '5002',
    protocol: '${MARKETPLACE_IPFS_PROTOCOL}' || 'https'
  }
};

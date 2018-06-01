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
  repux: {
    metaindexer: {
      protocol: '${MARKETPLACE_METAINDEXER_PROTOCOL}' || 'https',
      host: '${MARKETPLACE_METAINDEXER_HOST}' || '192.168.99.101',
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
    demoTokenContractAddress: '${MARKETPLACE_SC_TOKEN_ADDRESS}' || '0x225e1aa666d0deff793d35663066d0675fd3b6c4',
    registryContractAddress: '${MARKETPLACE_SC_REGISTRY_ADDRESS}' || '0xbd83c21e6f0a9547abe908c6faa02a55512d57b4'
  },
  ipfs: {
    host: '${MARKETPLACE_IPFS_HOST}' || '192.168.99.101',
    port: '${MARKETPLACE_IPFS_PORT}' || '5001',
    protocol: '${MARKETPLACE_IPFS_PROTOCOL}' || 'https'
  }
};

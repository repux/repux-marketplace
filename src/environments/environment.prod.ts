import { BigNumber } from 'bignumber.js';

BigNumber.config({
  DECIMAL_PLACES: 40,
  EXPONENTIAL_AT: [-40, 40],
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0
  }
});

export const environment = {
  production: true,
  repux: {
    metaindexer: {
      protocol: 'http',
      host: '192.168.99.101',
      port: 9201,
      searchUrl: 'repux/_search'
    },
    pageSizeOptions: [10, 25, 50, 100],
    currency: {
      defaultName: 'REPUX',
      precision: 18,
      format: '1.0-18',
      pattern: /^\d*([,\.]\d{0,18})?$/
    },
    demoTokenContractAddress: '0x225e1aa666d0deff793d35663066d0675fd3b6c4',
    registryContractAddress: '0xbd83c21e6f0a9547abe908c6faa02a55512d57b4'
  },
  ipfs: {
    host: '192.168.99.101',
    port: '5001',
    protocol: 'http'
  }
};

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
      host: '192.168.99.100',
      port: 9201,
      searchUrl: 'repux/_search'
    },
    pageSizeOptions: [10, 25, 50, 100],
    currency: {
      defaultName: 'REPUX',
      precision: 18
    }
  }
};

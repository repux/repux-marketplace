import { environment as devEnvironment } from './environment.base';

export const environment = Object.assign({}, devEnvironment);
environment.production = false;
environment.networkId = 1000;
environment.networkName = 'Truffle Development Network';

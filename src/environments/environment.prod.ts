import { environment as devEnvironment } from './environment.base';

export const environment = Object.assign({}, devEnvironment);
environment.production = true;
environment.intercomAppId = 'hzgw7cij';

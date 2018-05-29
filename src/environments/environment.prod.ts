import { environment as devEnvironment } from './environment';

export const environment = Object.assign({}, devEnvironment);
environment.production = true;

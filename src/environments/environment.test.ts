import { environment as devEnvironment } from './environment.base';

export const environment = Object.assign({}, devEnvironment);
environment.repux.categoriesListPath = './assets/data-product-categories.json';

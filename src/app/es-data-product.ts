import { DataProduct } from './data-product';
import { Deserializable } from './deserializable';

export class EsDataProduct implements Deserializable<EsDataProduct> {
  index: string;
  type: string;
  id: string;
  score: number;
  source: DataProduct;

  deserialize(input: any): EsDataProduct {
    this.index = input._index;
    this.type = input._type;
    this.id = input._id;
    this.score = input._score;
    this.source = new DataProduct();

    this.source.deserialize(input._source);
    return this;
  }
}

import { ProductCategoryService } from './product-category.service';

describe('ProductCategoryService', () => {
  let service: ProductCategoryService;
  let httpClientSpy: { get: jasmine.Spy };
  let toPromiseSpy;
  const categories = [
    {
      'name': 'Category 1',
      'subcategories': [
        {
          'name': 'Subcategory 1',
          'subcategories': [
            {
              'name': 'Sub-Subcategory 1'
            }
          ]
        },
        {
          'name': 'Subcategory 2'
        }
      ]
    },
    {
      'name': 'Category 2'
    }
  ];

  beforeEach(() => {
    toPromiseSpy = jasmine.createSpy();
    httpClientSpy = jasmine.createSpyObj('HttpClient', [ 'get' ]);
    httpClientSpy.get.and.returnValue({
      toPromise: toPromiseSpy
    });
    service = new ProductCategoryService(<any> httpClientSpy);
  });

  describe('#getCategories()', () => {
    it('should call get method on http object when there are no categories and when categories exists ' +
      'then simple return them', async () => {
      toPromiseSpy.and.returnValue(Promise.resolve(categories));
      let result = await service.getCategories();
      expect(result).toBe(categories);
      result = await service.getCategories();
      expect(result).toBe(categories);
      expect(httpClientSpy.get.calls.count()).toBe(1);
    });
  });

  describe('#getFlattenCategories()', () => {
    it('should call getCategories() and return flatten categories', async () => {
      toPromiseSpy.and.returnValue(Promise.resolve(categories));
      const result = await service.getFlattenCategories();
      expect(result.length).toBe(5);
      expect(result[ 0 ]).toBe('Category 1');
      expect(result[ 1 ]).toBe('Category 1 > Subcategory 1');
      expect(result[ 2 ]).toBe('Category 1 > Subcategory 1 > Sub-Subcategory 1');
      expect(result[ 3 ]).toBe('Category 1 > Subcategory 2');
      expect(result[ 4 ]).toBe('Category 2');
      expect(httpClientSpy.get.calls.count()).toBe(1);
    });
  });
});

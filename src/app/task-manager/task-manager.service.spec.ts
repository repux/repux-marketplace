import { TaskManagerService } from './task-manager.service';

describe('TaskManagerService', () => {
  let matDialogSpy: { search: jasmine.Spy };
  let service: TaskManagerService;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    service = new TaskManagerService(<any> matDialogSpy);
  });

  describe('#get tasks()', () => {
    it('should return all tasks', () => {
      expect(service.tasks).toEqual([]);
    });
  })
});

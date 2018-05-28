import { TaskManagerService } from '../task-manager/task-manager.service';

export interface Task {
  name: string;
  status: string;
  finished: boolean;
  progress: number;
  errors: ReadonlyArray<string>;
  needsUserAction: boolean;
  userActionName: string;
  run(taskManagerService: TaskManagerService): void;
  cancel(): void;
  callUserAction(): void;
}

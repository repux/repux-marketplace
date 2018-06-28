import { TaskManagerService } from '../services/task-manager.service';
import { TaskType } from './task-type';

export interface Task {
  taskType: TaskType;
  name: string;
  status: string;
  finished: boolean;
  progress: number;
  errors: ReadonlyArray<string>;
  needsUserAction: boolean;
  userActionName: string;
  walletSpecific: boolean;
  productAddress: string;

  run(taskManagerService: TaskManagerService): void;

  cancel(): void;

  callUserAction(): void;
}

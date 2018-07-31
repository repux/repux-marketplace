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
  productAddress: string;
  walletAddress: string;

  run(taskManagerService: TaskManagerService): Promise<void> | void;

  cancel(): void;

  callUserAction(): void;
}

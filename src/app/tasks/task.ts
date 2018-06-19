import { TaskManagerService } from '../services/task-manager.service';

export interface Task {
  name: string;
  status: string;
  finished: boolean;
  progress: number;
  errors: ReadonlyArray<string>;
  needsUserAction: boolean;
  userActionName: string;
  walletSpecific: boolean;

  run(taskManagerService: TaskManagerService): void;

  cancel(): void;

  callUserAction(): void;
}

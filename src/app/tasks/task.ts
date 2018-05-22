import { TaskManagerService } from "../task-manager/task-manager.service";

export interface Task {
  run(taskManagerService: TaskManagerService): void;
  cancel(): void;
  callUserAction(): void;
  name: string;
  finished: boolean;
  progress: number;
  errors: string[];
  needsUserAction: boolean;
  userActionName: string;
}

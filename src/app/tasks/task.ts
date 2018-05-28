import { TaskManagerService } from "../task-manager/task-manager.service";

export interface Task {
  run(taskManagerService: TaskManagerService): void;
  cancel(): void;
  callUserAction(): void;
  name: string;
  status: string;
  finished: boolean;
  progress: number;
  errors: ReadonlyArray<string>;
  needsUserAction: boolean;
  userActionName: string;
}

import { TaskManagerService } from '../services/task-manager.service';
import { TaskType } from './task-type';
import { ActionButtonType } from '../shared/enums/action-button-type';
import { DataProduct } from '../shared/models/data-product';

export interface Task {
  taskType: TaskType;
  name: string;
  status: string;
  finished: boolean;
  progress: number;
  errors: ReadonlyArray<string>;
  productAddress: string;
  walletAddress: string;
  actionButton?: ActionButtonType;
  dataProduct?: DataProduct;

  run(taskManagerService: TaskManagerService): Promise<void> | void;

  cancel(): void;
}

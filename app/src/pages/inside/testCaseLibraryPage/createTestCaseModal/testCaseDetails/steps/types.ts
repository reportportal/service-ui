import { Step } from 'pages/inside/testCaseLibraryPage/types';

export interface StepsProps {
  steps: Step[];
  onAddStep: (index?: number) => void;
  onRemoveStep: (stepId: number) => void;
  onMoveStep: ({ stepId, direction }: { stepId: number; direction: 'up' | 'down' }) => void;
  onReorderSteps: (reorderedSteps: Step[]) => void;
  formName: string;
  isKeyById?: boolean;
}

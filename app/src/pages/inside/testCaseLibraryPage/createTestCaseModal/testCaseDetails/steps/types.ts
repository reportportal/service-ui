import { Step } from 'types/testCase';

export interface StepsProps {
  steps: Step[];
  onAddStep: (index?: number) => void;
  onRemoveStep: (stepId: number) => void;
  onMoveStep: ({ stepId, direction }: { stepId: number; direction: 'up' | 'down' }) => void;
  onReorderSteps: (reorderedSteps: Step[]) => void;
  formName: string;
  isKeyById?: boolean;
}

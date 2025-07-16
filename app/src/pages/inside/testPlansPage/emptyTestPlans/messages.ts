import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  pageHeader: {
    id: 'TestPlansPage.header',
    defaultMessage: 'No Test Plans created yet',
  },
  pageDescription: {
    id: 'TestPlansPage.description',
    defaultMessage:
      "Track your project's progress and achievements by creating your first test plan. Test plans aid in planning and measuring success over time.",
  },
  createTestPlansLabel: {
    id: 'TestPlansPage.createTestPlanLabel',
    defaultMessage: 'Create Test Plan',
  },
  numerableBlockTitle: {
    id: 'TestPlansPage.numerableBlockTitle',
    defaultMessage: 'Why is it beneficial?',
  },
  progressTracking: {
    id: 'TestPlansPage.progressTracking',
    defaultMessage:
      '<strong>Progress tracking:</strong> Milestones provide clear checkpoints, allowing teams to easily track progress and ensure testing is aligned with project timelines',
  },
  goalAlignment: {
    id: 'TestPlansPage.goalAlignment',
    defaultMessage:
      '<strong>Goal alignment:</strong> They help align testing activities with project goals, ensuring that testing focuses on critical deliverables and objectives at each stage',
  },
  resourceManagement: {
    id: 'TestPlansPage.resourceManagement',
    defaultMessage:
      '<strong>Resource management:</strong> Milestones facilitate better planning and allocation of resources by identifying crucial testing phases and deadlines',
  },
});

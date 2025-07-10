import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  pageHeader: {
    id: 'MilestonesPage.header',
    defaultMessage: 'No Milestones created yet',
  },
  pageDescription: {
    id: 'MilestonesPage.description',
    defaultMessage:
      "Track your project's progress and achievements by creating your first milestone. Milestones aid in planning and measuring success over time.",
  },
  createMilestoneLabel: {
    id: 'MilestonesPage.createMilestoneLabel',
    defaultMessage: 'Create Milestone',
  },
  numerableBlockTitle: {
    id: 'MilestonesPage.numerableBlockTitle',
    defaultMessage: 'Why is it beneficial?',
  },
  progressTracking: {
    id: 'MilestonesPage.progressTracking',
    defaultMessage:
      '<strong>Progress tracking:</strong> Milestones provide clear checkpoints, allowing teams to easily track progress and ensure testing is aligned with project timelines',
  },
  goalAlignment: {
    id: 'MilestonesPage.goalAlignment',
    defaultMessage:
      '<strong>Goal alignment:</strong> They help align testing activities with project goals, ensuring that testing focuses on critical deliverables and objectives at each stage',
  },
  resourceManagement: {
    id: 'MilestonesPage.resourceManagement',
    defaultMessage:
      '<strong>Resource management:</strong> Milestones facilitate better planning and allocation of resources by identifying crucial testing phases and deadlines',
  },
});

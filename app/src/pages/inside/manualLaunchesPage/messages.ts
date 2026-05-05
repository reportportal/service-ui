import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  manualLaunchesTitle: {
    id: 'Sidebar.manualLaunchesBtn',
    defaultMessage: 'Manual Launches',
  },
  noLaunches: {
    id: 'ManualLaunchesPage.noLaunches',
    defaultMessage: 'No manual Launches yet',
  },
  noLaunchesDescription: {
    id: 'ManualLaunchesPage.noLaunchesDescription',
    defaultMessage:
      'You can either create a new Launch from an existing Test Plan or directly in the Test Case Library.',
  },
  milestonesLink: {
    id: 'ManualLaunchesPage.milestonesLink',
    defaultMessage: 'Go to Milestones',
  },
  testLibraryLink: {
    id: 'ManualLaunchesPage.testLibraryLink',
    defaultMessage: 'Open Test Library',
  },
  searchPlaceholder: {
    id: 'ManualLaunchesPage.searchPlaceholder',
    defaultMessage: 'Search launches by name',
  },
  launchIdColumn: {
    id: 'ManualLaunchesPage.launchIdColumn',
    defaultMessage: 'ID',
  },
});

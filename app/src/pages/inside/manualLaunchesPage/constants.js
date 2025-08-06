import { PROJECT_TEST_PLANS_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages/constants';
import { messages } from './messages';

export const REDIRECT_LINKS = [
  {
    link: PROJECT_TEST_PLANS_PAGE,
    title: messages.testPlansLink,
  },
  {
    link: TEST_CASE_LIBRARY_PAGE,
    title: messages.testLibraryLink,
  },
];

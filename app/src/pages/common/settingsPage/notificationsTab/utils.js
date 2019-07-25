import { OWNER } from 'common/constants/permissions';

export const convertNotificationCaseForSubmission = (obj) => {
  const { informOwner, recipients, sendCase, launchNames = [], attributes = [] } = obj;
  return {
    recipients: informOwner ? [...recipients, OWNER] : recipients,
    sendCase,
    launchNames,
    attributes,
  };
};

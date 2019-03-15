import { compareAttributes } from 'common/utils/attributeUtils';

const compareCases = (caseOne, caseTwo) => {
  if (caseOne.sendCase !== caseTwo.sendCase) {
    return false;
  }
  if (caseOne.attributes.length !== caseTwo.attributes.length) {
    return false;
  }
  if (caseOne.launchNames.length !== caseTwo.launchNames.length) {
    return false;
  }
  if (caseOne.recipients.length !== caseTwo.recipients.length) {
    return false;
  }
  return (
    caseOne.attributes.every((attribute) =>
      caseTwo.attributes.find((item) => compareAttributes(attribute, item)),
    ) &&
    caseOne.launchNames.sort().every((launch) => caseTwo.launchNames.includes(launch)) &&
    caseOne.recipients.sort().every((recipient) => caseTwo.recipients.includes(recipient))
  );
};

export const validate = ({ cases }) => {
  const casesErrors = cases
    .map((notificationsCase, index) => {
      if (notificationsCase.recipients.length === 0 && !notificationsCase.informOwner) {
        return {
          confirmed: 'error',
          recipients: 'recipientsHint',
        };
      }

      if (cases.length > 1) {
        const hasDuplicates = cases.find(
          (item, i) => compareCases(item, notificationsCase) && i !== index,
        );
        if (hasDuplicates) {
          return {
            confirmed: 'hasDuplicates',
          };
        }
      }
      return null;
    })
    .filter(Boolean);

  return {
    cases: casesErrors,
  };
};

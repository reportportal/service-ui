const compareCases = (caseOne, caseTwo) => {
  if (caseOne.sendCase !== caseTwo.sendCase) {
    return false;
  }
  if (caseOne.tags.length !== caseTwo.tags.length) {
    return false;
  }
  if (caseOne.launchNames.length !== caseTwo.launchNames.length) {
    return false;
  }
  if (caseOne.recipients.length !== caseTwo.recipients.length) {
    return false;
  }
  return (
    caseOne.tags.sort().every((tag) => caseTwo.tags.includes(tag)) &&
    caseOne.launchNames.sort().every((launch) => caseTwo.launchNames.includes(launch)) &&
    caseOne.recipients.sort().every((recipient) => caseTwo.recipients.includes(recipient))
  );
};

export const validate = ({ emailCases }) => {
  const errors = {};
  const emailCasesArrayErrors = [];

  emailCases.forEach((item, index, arr) => {
    const emailCasesErrors = {};

    if (arr.length > 1) {
      const alreadyInArray = arr.find((it, id) => compareCases(it, item) && id !== index);
      if (alreadyInArray) {
        emailCasesErrors.confirmed = 'hasDuplicates';
        emailCasesArrayErrors[index] = emailCasesErrors;
      }
    }

    if (item.recipients.length === 0 && !item.informOwner) {
      emailCasesErrors.recipients = 'recipientsHint';
      emailCasesErrors.confirmed = 'error';
      emailCasesArrayErrors[index] = emailCasesErrors;
    }
  });
  if (emailCasesArrayErrors.length) {
    errors.emailCases = emailCasesArrayErrors;
  }

  return errors;
};

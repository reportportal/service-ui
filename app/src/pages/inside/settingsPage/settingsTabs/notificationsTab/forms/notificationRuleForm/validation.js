const compareRules = (ruleOne, ruleTwo) => {
  if (ruleOne.launchStatsRule !== ruleTwo.launchStatsRule) {
    return false;
  }
  if (ruleOne.launchTagRule.length !== ruleTwo.launchTagRule.length) {
    return false;
  }
  if (ruleOne.launchNameRule.length !== ruleTwo.launchNameRule.length) {
    return false;
  }
  if (ruleOne.recipients.length !== ruleTwo.recipients.length) {
    return false;
  }
  return (
    ruleOne.launchTagRule.sort().every((tag) => ruleTwo.launchTagRule.includes(tag)) &&
    ruleOne.launchNameRule.sort().every((launch) => ruleTwo.launchNameRule.includes(launch)) &&
    ruleOne.recipients.sort().every((recipient) => ruleTwo.recipients.includes(recipient))
  );
};

export const validate = ({ rules }) => {
  const errors = {};
  const rulesArrayErrors = [];

  rules.forEach((item, index, arr) => {
    const rulesErrors = {};

    if (arr.length > 1) {
      const alreadyInArray = arr.find((it, id) => compareRules(it, item) && id !== index);
      if (alreadyInArray) {
        rulesErrors.confirmed = 'hasDuplicates';
        rulesArrayErrors[index] = rulesErrors;
      }
    }

    if (item.recipients.length === 0 && !item.informOwner) {
      rulesErrors.recipients = 'recipientsHint';
      rulesErrors.confirmed = 'error';
      rulesArrayErrors[index] = rulesErrors;
    }
  });
  if (rulesArrayErrors.length) {
    errors.rules = rulesArrayErrors;
  }

  return errors;
};

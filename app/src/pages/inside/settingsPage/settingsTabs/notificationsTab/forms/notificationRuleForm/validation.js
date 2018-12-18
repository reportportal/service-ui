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
  const rulesErrors = rules
    .map((rule, index) => {
      if (rule.recipients.length === 0 && !rule.informOwner) {
        return {
          confirmed: 'error',
          recipients: 'recipientsHint',
        };
      }

      if (rules.length > 1) {
        const hasDuplicates = rules.find((item, i) => compareRules(item, rule) && i !== index);
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
    rules: rulesErrors,
  };
};

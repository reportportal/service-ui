import { messages } from '../translations';

export const getActionMessage = (intl, activityItem) => {
  const user = activityItem.user;

  switch (activityItem.actionType) {
    case 'updateItem':
      return intl.formatMessage(
        activityItem.details.history.length > 1 ? messages.updateItemIssue : messages.updateItem,
        { name: user },
      );
    case 'postIssue':
      return intl.formatMessage(messages.postIssue, { name: user });
    case 'linkIssue':
      return intl.formatMessage(messages.linkIssue, { name: user });
    case 'unlinkIssue':
      return intl.formatMessage(messages.unlinkIssue, { name: user });
    case 'analyzeItem':
      return intl.formatMessage(messages.changedByAnalyzer);
    case 'linkIssueAa':
      return intl.formatMessage(messages.issueLoadByAnalyzer);
    default:
      return activityItem.actionType;
  }
};

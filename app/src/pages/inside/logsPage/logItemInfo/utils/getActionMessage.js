import { messages } from '../translations';

export const getActionMessage = (intl, activityItem) => {
  switch (activityItem.actionType) {
    case 'updateItem':
      return intl.formatMessage(
        activityItem.details.history.length > 1 ? messages.updateItemIssue : messages.updateItem,
      );
    case 'postIssue':
      return intl.formatMessage(messages.postIssue);
    case 'linkIssue':
      return intl.formatMessage(messages.linkIssue);
    case 'unlinkIssue':
      return intl.formatMessage(messages.unlinkIssue);
    case 'analyzeItem':
      return intl.formatMessage(messages.changedByAnalyzer);
    case 'linkIssueAa':
      return intl.formatMessage(messages.issueLoadByAnalyzer);
    default:
      return activityItem.actionType;
  }
};

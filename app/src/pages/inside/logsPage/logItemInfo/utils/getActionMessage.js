import { messages } from '../translations';

export const getActionMessage = (intl, activityItem) => {
  switch (activityItem.actionType) {
    case 'update_item':
      return intl.formatMessage(
        activityItem.history.length > 1 ? messages.updateItemIssue : messages.updateItem,
      );
    case 'post_issue':
      return intl.formatMessage(messages.postIssue);
    case 'link_issue':
      return intl.formatMessage(messages.linkIssue);
    case 'unlink_issue':
      return intl.formatMessage(messages.unlinkIssue);
    case 'analyze_item':
      return intl.formatMessage(messages.changedByAnalyzer);
    case 'link_issue_aa':
      return intl.formatMessage(messages.issueLoadByAnalyzer);
    default:
      return activityItem.actionType;
  }
};

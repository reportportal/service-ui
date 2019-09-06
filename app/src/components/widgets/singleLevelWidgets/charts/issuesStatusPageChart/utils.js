import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { messages } from 'components/widgets/common/messages';
import { IssueTypeStatTooltip } from '../common/issueTypeStatTooltip';

const calculateTooltipParams = (data, color, customProps) => {
  const { content, formatMessage, wrapperClassName } = customProps;
  const { id, index, value } = data;
  const { name } = content[index];

  return {
    itemName: name,
    startTime: null,
    itemCases: `${value} ${formatMessage(messages.cases)}`,
    color: color[id],
    issueStatNameProps: { itemName: formatMessage(messages[id]) },
    wrapperClassName,
  };
};

export const createTooltip = (content, formatMessage, wrapperClassName) =>
  createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
    content,
    formatMessage,
    wrapperClassName,
  });

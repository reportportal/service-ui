import * as COLORS from 'common/constants/colors';
import { STATS_PASSED } from 'common/constants/statistics';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { IssueTypeStatTooltip } from '../../issueTypeStatTooltip';
import { getPercentage, getChartVieModeOptions, calculateTooltipParams } from './utils';

export const NOT_PASSED_STATISTICS_KEY = 'statistics$executions$notPassed';

export const getConfig = ({
  content,
  isPreview,
  formatMessage,
  positionCallback,
  size,
  onRendered,
  viewMode,
}) => {
  const totalItems = content.total;
  const columnData = {
    [STATS_PASSED]: content.passed,
    [NOT_PASSED_STATISTICS_KEY]: totalItems - content.passed,
  };
  const columns = [
    [STATS_PASSED, columnData[STATS_PASSED]],
    [NOT_PASSED_STATISTICS_KEY, columnData[NOT_PASSED_STATISTICS_KEY]],
  ];
  const chartData = {
    columns,
    type: viewMode,
    groups: [[STATS_PASSED, NOT_PASSED_STATISTICS_KEY]],
    order: null,
    colors: {
      [STATS_PASSED]: COLORS.COLOR_PASSED,
      [NOT_PASSED_STATISTICS_KEY]: COLORS.COLOR_NOTPASSED,
    },
    labels: {
      show: !isPreview,
      format: (value) => (isPreview ? '' : `${getPercentage(value, totalItems)}%`),
    },
  };
  const viewModeOptions = getChartVieModeOptions(viewMode, isPreview, totalItems);

  return {
    data: chartData,
    ...viewModeOptions,
    interaction: {
      enabled: !isPreview,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        totalItems,
        formatMessage,
      }),
    },
    size,
    onrendered: onRendered,
    transition: {
      duration: 0,
    },
  };
};

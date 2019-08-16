import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';

export const getPercentage = (value, totalItems) => (value / totalItems * 100).toFixed(2);

export const getChartVieModeOptions = (viewMode, isPreview, totalItems) =>
  viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW]
    ? {
        bar: {
          width: {
            ratio: 0.35,
          },
        },
        padding: {
          top: isPreview ? 0 : 30,
          left: 20,
          right: 20,
          bottom: 0,
        },
        axis: {
          rotated: true,
          x: {
            show: false,
          },
          y: {
            show: false,
            padding: {
              top: 0,
            },
          },
          bar: {
            width: {
              ratio: 0.35,
            },
          },
        },
      }
    : {
        pie: {
          label: {
            show: !isPreview,
            threshold: 0.05,
            format: (value) => `${getPercentage(value, totalItems)}%`,
          },
        },
        padding: {
          top: isPreview ? 0 : 85,
        },
      };

export const calculateTooltipParams = (data, color, customProps) => {
  const { totalItems, formatMessage } = customProps;
  const { id, name, value } = data[0];

  return {
    itemsCount: `${value} (${getPercentage(value, totalItems)}%)`,
    color: color(id),
    issueStatNameProps: { itemName: name, defectTypes: {}, formatMessage },
  };
};

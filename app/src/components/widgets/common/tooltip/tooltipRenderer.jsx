import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const createTooltipRenderer = (TooltipComponent, paramsCalculator, customProps) => (
  data,
  defaultTitleFormat,
  defaultValueFormat,
  color,
) => {
  const tooltipProps = paramsCalculator(data, color, customProps);

  return ReactDOMServer.renderToStaticMarkup(<TooltipComponent {...tooltipProps} />);
};

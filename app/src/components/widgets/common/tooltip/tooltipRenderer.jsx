import React from 'react';
import ReactDOMServer from 'react-dom/server';

const renderTooltip = (TooltipComponent, props) =>
  ReactDOMServer.renderToStaticMarkup(<TooltipComponent {...props} />);

export const createTooltipRenderer = (tooltipComponent, paramsCalculator, customProps) => (
  data,
  defaultTitleFormat,
  defaultValueFormat,
  color,
) => {
  const tooltipProps = paramsCalculator(data, color, customProps);
  return renderTooltip(tooltipComponent, tooltipProps);
};

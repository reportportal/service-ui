import { withTooltip } from '../tooltip';

export const withHoverableTooltip = ({ TooltipComponent, data }) =>
  withTooltip({ TooltipComponent, data: { ...data, hoverable: true } });

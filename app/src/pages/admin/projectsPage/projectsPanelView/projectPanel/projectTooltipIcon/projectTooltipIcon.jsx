import { Component } from 'react';
import PropTypes from 'prop-types';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';

@withHoverableTooltip({
  TooltipComponent: TextTooltip,
  data: {
    width: 160,
    noArrow: false,
    desktopOnly: false,
    noMobile: false,
  },
})
export class ProjectTooltipIcon extends Component {
  static propTypes = {
    tooltipContent: PropTypes.string,
    children: PropTypes.node,
  };
  static defaultProps = {
    tooltipContent: '',
    children: '',
  };

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}

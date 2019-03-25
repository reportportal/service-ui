import { Component } from 'react';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';

@withTooltip({
  TooltipComponent: TextTooltip,
  data: {
    width: 180,
    noArrow: false,
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

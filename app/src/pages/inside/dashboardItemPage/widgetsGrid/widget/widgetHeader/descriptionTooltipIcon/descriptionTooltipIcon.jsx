import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { ALIGN_LEFT } from 'components/main/tooltips/constants';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import styles from './descriptionTooltipIcon.scss';

const cx = classNames.bind(styles);

@withHoverableTooltip({
  TooltipComponent: TextTooltip,
  data: {
    width: 300,
    align: ALIGN_LEFT,
    leftOffset: -50,
    noArrow: true,
  },
})
export class DescriptionTooltipIcon extends Component {
  static propTypes = {
    tooltipContent: PropTypes.string,
  };
  static defaultProps = {
    tooltipContent: '',
  };

  render() {
    return (
      <div className={cx('description-tooltip-icon')} content={this.props.tooltipContent}>
        {Parser(TooltipIcon)}
      </div>
    );
  }
}

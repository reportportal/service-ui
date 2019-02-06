import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { ALIGN_LEFT } from 'components/main/tooltips/constants';
import { withHoverableTooltip } from 'components/main/tooltips/hoverableTooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import TooltipIcon from 'common/img/tooltip-icon-inline.svg';
import styles from './filterTooltipIcon.scss';

const cx = classNames.bind(styles);

export const FilterTooltipIcon = withHoverableTooltip({
  TooltipComponent: TextTooltip,
  data: {
    align: ALIGN_LEFT,
    leftOffset: -50,
    noArrow: true,
  },
})(() => <div className={cx('filter-tooltip-icon')}>{Parser(TooltipIcon)}</div>);

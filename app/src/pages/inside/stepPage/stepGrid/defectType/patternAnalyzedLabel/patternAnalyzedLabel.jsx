import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import Parser from 'html-react-parser';
import PAIcon from 'common/img/pa_icon-inline.svg';
import { PatternAnalyzedTooltip } from './patternAnalyzedTooltip';
import styles from './patternAnalyzedLabel.scss';

const cx = classNames.bind(styles);

export const PatternAnalyzedLabel = withTooltip({
  TooltipComponent: PatternAnalyzedTooltip,
  data: {
    dynamicWidth: true,
  },
})(() => <div className={cx('pa-label')}>{Parser(PAIcon)}</div>);

PatternAnalyzedLabel.propTypes = {
  patternTemplates: PropTypes.array,
};

PatternAnalyzedLabel.defaultProps = {
  patternTemplates: [],
};

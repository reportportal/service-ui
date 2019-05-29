import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { PatternAnalyzedTooltip } from './patternAnalyzedTooltip';
import styles from './patternAnalyzedLabel.scss';

const cx = classNames.bind(styles);

export const PatternAnalyzedLabel = withTooltip({
  TooltipComponent: PatternAnalyzedTooltip,
  data: {
    width: 280,
  },
})(() => <div className={cx('pa-label')}>PA</div>);

PatternAnalyzedLabel.propTypes = {
  patternTemplates: PropTypes.array,
};

PatternAnalyzedLabel.defaultProps = {
  patternTemplates: [],
};

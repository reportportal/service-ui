import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './textTooltip.scss';

const cx = classNames.bind(styles);

export const TextTooltip = ({ tooltipContent }) => (
  <div className={cx('text-tooltip')}>{tooltipContent}</div>
);
TextTooltip.propTypes = {
  tooltipContent: PropTypes.string,
};
TextTooltip.defaultProps = {
  tooltipContent: '',
};

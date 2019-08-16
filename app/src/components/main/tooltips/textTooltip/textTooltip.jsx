import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import styles from './textTooltip.scss';

const cx = classNames.bind(styles);

export const TextTooltip = ({ tooltipContent }) => (
  <div className={cx('text-tooltip')}>{Parser(tooltipContent)}</div>
);
TextTooltip.propTypes = {
  tooltipContent: PropTypes.string,
};
TextTooltip.defaultProps = {
  tooltipContent: '',
};

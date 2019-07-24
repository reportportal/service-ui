import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './commandItemLogBlock.scss';

const cx = classNames.bind(styles);

export const CommandItemLogBlock = ({ commandTitle, content }) => (
  <div className={cx('command-item-log-block')}>
    <div className={cx('command-title')}>{commandTitle}</div>
    <div className={cx('command-content')}>{content}</div>
  </div>
);

CommandItemLogBlock.propTypes = {
  commandTitle: PropTypes.string,
  content: PropTypes.node,
};

CommandItemLogBlock.defaultProps = {
  commandTitle: '',
  content: null,
};

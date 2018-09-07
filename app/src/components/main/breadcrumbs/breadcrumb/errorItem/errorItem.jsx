import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import ErrorIcon from 'common/img/error-inline.svg';

import styles from './errorItem.scss';

const cx = classNames.bind(styles);

export const ErrorItem = () => (
  <div className={cx('error-item')}>
    <span className={cx('error-icon')}>{Parser(ErrorIcon)}</span>
    <span>Error Item</span>
  </div>
);

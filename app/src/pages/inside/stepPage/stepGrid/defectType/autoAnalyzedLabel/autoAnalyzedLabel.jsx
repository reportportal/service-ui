import classNames from 'classnames/bind';
import styles from './autoAnalyzedLabel.scss';

const cx = classNames.bind(styles);

export const AutoAnalyzedLabel = () => <div className={cx('aa-label')}>AA</div>;

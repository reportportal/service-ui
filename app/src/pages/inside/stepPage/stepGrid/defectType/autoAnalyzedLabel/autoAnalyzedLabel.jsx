import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import AAIcon from 'common/img/aa_activated-inline.svg';
import styles from './autoAnalyzedLabel.scss';

const cx = classNames.bind(styles);

export const AutoAnalyzedLabel = () => <div className={cx('aa-label')}>{Parser(AAIcon)}</div>;

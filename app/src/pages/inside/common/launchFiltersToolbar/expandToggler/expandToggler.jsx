import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { FormattedMessage } from 'react-intl';
import ArrowDownIcon from 'common/img/arrow-down-inline.svg';
import styles from './expandToggler.scss';

const cx = classNames.bind(styles);

export const ExpandToggler = ({ expanded, onToggleExpand }) => (
  <div className={cx('expand-toggler')} onClick={onToggleExpand}>
    {expanded ? (
      <FormattedMessage id="ExpandToggler.hideCriteria" defaultMessage="Hide criteria" />
    ) : (
      <FormattedMessage id="ExpandToggler.showCriteria" defaultMessage="Show criteria" />
    )}
    <div className={cx('icon', { expanded })}>{Parser(ArrowDownIcon)}</div>
  </div>
);
ExpandToggler.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
};

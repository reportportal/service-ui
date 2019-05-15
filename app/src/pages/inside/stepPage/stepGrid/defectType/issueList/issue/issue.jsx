import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { withTooltip } from 'components/main/tooltips/tooltip';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { IssueInfoTooltip } from './issueInfoTooltip';
import styles from './issue.scss';

const cx = classNames.bind(styles);

export const Issue = withTooltip({
  TooltipComponent: IssueInfoTooltip,
})(({ ticketId, url, onRemove }) => (
  <a href={url} className={cx('issue')}>
    <div className={cx('title')}>{ticketId}</div>
    <div className={cx('cross')} onClick={onRemove}>
      {Parser(CrossIcon)}
    </div>
  </a>
));
Issue.propTypes = {
  ticketId: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  btsProject: PropTypes.string.isRequired,
  btsUrl: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
};
Issue.defaultProps = {
  onRemove: () => {},
};

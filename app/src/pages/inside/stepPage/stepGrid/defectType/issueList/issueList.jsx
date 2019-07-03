import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Issue } from './issue';
import styles from './issueList.scss';

const cx = classNames.bind(styles);

export const IssueList = ({ issues, onRemove }) =>
  issues.map((issue) => (
    <div className={cx('issue-list-item')} key={`${issue.btsProject}_${issue.ticketId}`}>
      <Issue {...issue} onRemove={onRemove} />
    </div>
  ));

IssueList.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      ticketId: PropTypes.string,
      url: PropTypes.string,
      btsProject: PropTypes.string,
      btsUrl: PropTypes.string,
    }),
  ),
  onRemove: PropTypes.func,
};
IssueList.defaultProps = {
  issues: [],
  onRemove: () => {},
};

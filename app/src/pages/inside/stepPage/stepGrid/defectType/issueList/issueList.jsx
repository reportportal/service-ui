import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Issue } from './issue';
import styles from './issueList.scss';

const cx = classNames.bind(styles);

export const IssueList = ({ issues }) =>
  issues.map((issue) => (
    <div className={cx('issue-list-item')} key={issue.ticketId}>
      <Issue ticketId={issue.ticketId} url={issue.url} />
    </div>
  ));

IssueList.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      ticketId: PropTypes.string,
      url: PropTypes.string,
    }),
  ),
};
IssueList.defaultProps = {
  issues: [],
};

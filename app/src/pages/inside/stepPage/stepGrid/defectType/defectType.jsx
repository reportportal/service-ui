import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { MarkdownViewer } from 'components/main/markdown';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { DefectTypeItem } from './defectTypeItem';
import { AutoAnalyzedLabel } from './autoAnalyzedLabel';
import { IssueList } from './issueList';
import styles from './defectType.scss';

const cx = classNames.bind(styles);

const AALabel = () => (
  <div className={cx('aa-label')}>
    <AutoAnalyzedLabel />
  </div>
);

export const DefectType = ({ issue }) => (
  <div className={cx('defect-type')}>
    <div className={cx('defect-type-labels')}>
      {issue.autoAnalyzed && <AALabel />}
      {issue.issue_type && <DefectTypeItem type={issue.issue_type} />}
      <div className={cx('edit-icon')}>{Parser(PencilIcon)}</div>
    </div>
    <div className={cx('issues')}>
      <IssueList issues={issue.externalSystemIssues} />
    </div>
    <div className={cx('comment')}>
      <MarkdownViewer value={issue.comment} />
    </div>
  </div>
);

DefectType.propTypes = {
  issue: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};
DefectType.defaultProps = {
  onEdit: () => {},
};

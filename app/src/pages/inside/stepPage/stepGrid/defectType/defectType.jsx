import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { MarkdownViewer } from 'components/main/markdown';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { PatternAnalyzedLabel } from 'pages/inside/common/patternAnalyzedLabel';
import { AutoAnalyzedLabel } from './autoAnalyzedLabel';
import { IssueList } from './issueList';
import styles from './defectType.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  ignoreAATooltip: {
    id: 'StepGrid.ignoreAutoanalyzerTooltip',
    defaultMessage: 'Ignore item in Auto-Analysis',
  },
});

const IgnoredInAALabel = injectIntl(({ intl }) => (
  <div className={cx('ignore-aa-label')} title={intl.formatMessage(messages.ignoreAATooltip)}>
    <FormattedMessage id="StepGrid.ignoreAAShort" defaultMessage="Ignore AA" />
  </div>
));

const AALabel = () => (
  <div className={cx('aa-label')}>
    <AutoAnalyzedLabel />
  </div>
);

const PALabel = ({ patternTemplates }) => (
  <div className={cx('pa-label')}>
    <PatternAnalyzedLabel patternTemplates={patternTemplates} />
  </div>
);

PALabel.propTypes = {
  patternTemplates: PropTypes.array.isRequired,
};

export const DefectType = track()(
  ({ issue, onEdit, onRemove, tracking, editEventInfo, patternTemplates }) => (
    <div className={cx('defect-type')}>
      <div className={cx('defect-type-labels')}>
        {issue.ignoreAnalyzer && <IgnoredInAALabel />}
        {issue.autoAnalyzed && <AALabel />}
        {!!patternTemplates.length && <PALabel patternTemplates={patternTemplates} />}
        {issue.issueType && (
          <DefectTypeItem
            type={issue.issueType}
            onClick={() => {
              tracking.trackEvent(editEventInfo);
              onEdit();
            }}
          />
        )}
        <div className={cx('edit-icon')} onClick={onEdit}>
          {Parser(PencilIcon)}
        </div>
      </div>
      <div className={cx('issues')}>
        <IssueList issues={issue.externalSystemIssues} onRemove={onRemove} />
      </div>
      <div className={cx('comment')}>
        <MarkdownViewer value={issue.comment} />
      </div>
    </div>
  ),
);

DefectType.propTypes = {
  issue: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
  editEventInfo: PropTypes.object,
  patternTemplates: PropTypes.array,
};
DefectType.defaultProps = {
  onEdit: () => {},
  onRemove: () => {},
  editEventInfo: {},
  patternTemplates: [],
};

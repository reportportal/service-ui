/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import { MarkdownViewer } from 'components/main/markdown';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { PatternAnalyzedLabel } from 'pages/inside/common/patternAnalyzedLabel';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
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

export const IgnoredInAALabel = injectIntl(({ intl, className }) => (
  <div
    className={cx('ignore-aa-label', className)}
    title={intl.formatMessage(messages.ignoreAATooltip)}
  >
    <FormattedMessage id="StepGrid.ignoreAAShort" defaultMessage="Ignore AA" />
  </div>
));
IgnoredInAALabel.propTypes = {
  intl: PropTypes.object.isRequired,
  className: PropTypes.string,
};
IgnoredInAALabel.defaultProps = {
  className: '',
};

export const AALabel = () => (
  <div className={cx('aa-label')}>
    <AutoAnalyzedLabel />
  </div>
);

export const PALabel = ({ patternTemplates }) => (
  <div className={cx('pa-label')}>
    <PatternAnalyzedLabel patternTemplates={patternTemplates} showTooltip />
  </div>
);

PALabel.propTypes = {
  patternTemplates: PropTypes.array.isRequired,
};

export const DefectType = ({ issue, onEdit, onRemove, patternTemplates, events }) => {
  const { trackEvent } = useTracking();
  const eventData = issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);
  const onClickEdit = (event) => {
    event && trackEvent(event);
    onEdit();
  };

  const onClickIssue = (pluginName) => {
    const { onClickIssueTicketEvent } = events;
    onClickIssueTicketEvent && trackEvent(onClickIssueTicketEvent(pluginName));
  };

  return (
    <div className={cx('defect-type')}>
      <div className={cx('defect-type-labels')}>
        {issue.ignoreAnalyzer && <IgnoredInAALabel />}
        {issue.autoAnalyzed && <AALabel />}
        {!!patternTemplates.length && <PALabel patternTemplates={patternTemplates} />}
        {issue.issueType && (
          <DefectTypeItem
            type={issue.issueType}
            onClick={() => onClickEdit(events.onEditEvent && events.onEditEvent(eventData))}
          />
        )}
        <div
          className={cx('edit-icon')}
          onClick={() => onClickEdit(events.onEditEvent && events.onEditEvent(eventData, 'Edit'))}
        >
          {Parser(PencilIcon)}
        </div>
      </div>
      <div className={cx('issues')}>
        <IssueList issues={issue.externalSystemIssues} onClick={onClickIssue} onRemove={onRemove} />
      </div>
      <div className={cx('comment')}>
        <ScrollWrapper hideTracksWhenNotNeeded autoHeight autoHeightMax={90}>
          <MarkdownViewer value={issue.comment} />
        </ScrollWrapper>
      </div>
    </div>
  );
};

DefectType.propTypes = {
  issue: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onRemove: PropTypes.func,
  patternTemplates: PropTypes.array,
  events: PropTypes.object,
};
DefectType.defaultProps = {
  onEdit: () => {},
  onRemove: () => {},
  patternTemplates: [],
  events: {},
};

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

import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import styles from './uniqueBugsTable.scss';
import {
  BUG_ID_COLUMN_KEY,
  SUBMIT_DATE_COLUMN_KEY,
  FOUND_IN_COLUMN_KEY,
  SUBMITTER_COLUMN_KEY,
} from './constants';
import { COLUMN_NAMES_MAP, hintMessages } from './messages';
import { FoundIn } from './foundIn';

export const cx = classNames.bind(styles);

const ColumnProps = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const BugIDColumn = ({ className, value: { id, url } }) => (
  <div className={cx('bug-id-col', className)}>
    {url ? (
      <a href={url} target="_blank" className={cx('bug-link')}>
        {id}
      </a>
    ) : (
      id
    )}
  </div>
);
BugIDColumn.propTypes = ColumnProps;

const FoundInColumn = ({ className, value }) => (
  <FoundIn className={className} id={value.id} items={value.items} />
);
FoundInColumn.propTypes = ColumnProps;

const SubmitDateColumn = ({ className, value: { submitDate = 0 } }, formatMessage) => (
  <div className={cx('submit-date-col', className)}>
    <span className={cx('mobile-hint')}>{formatMessage(hintMessages.submitDateHint)}</span>
    <AbsRelTime startTime={Number(submitDate)} />
  </div>
);
SubmitDateColumn.propTypes = ColumnProps;

const SubmitterColumn = ({ className, value: { submitter = '' } }) => (
  <div className={cx('submitter-col', className)}>{submitter}</div>
);
SubmitterColumn.propTypes = ColumnProps;

const columnComponentsMap = {
  [BUG_ID_COLUMN_KEY]: BugIDColumn,
  [FOUND_IN_COLUMN_KEY]: FoundInColumn,
  [SUBMIT_DATE_COLUMN_KEY]: SubmitDateColumn,
  [SUBMITTER_COLUMN_KEY]: SubmitterColumn,
};

const getColumn = (columnType, formatMessage) => ({
  id: columnType,
  title: {
    full: formatMessage(COLUMN_NAMES_MAP[columnType]),
  },
  component: (data) => columnComponentsMap[columnType](data, formatMessage),
});

const COLUMNS = [
  BUG_ID_COLUMN_KEY,
  FOUND_IN_COLUMN_KEY,
  SUBMIT_DATE_COLUMN_KEY,
  SUBMITTER_COLUMN_KEY,
];

@injectIntl
export class UniqueBugsTable extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.columns = this.getColumns(props.intl.formatMessage);
  }

  getColumns = (formatMessage) => COLUMNS.map((item) => getColumn(item, formatMessage));

  render() {
    const { result } = this.props.widget.content;
    const data = Object.keys(result).map((key) => ({ id: key, ...result[key] }));

    return (
      <ScrollWrapper hideTracksWhenNotNeeded>
        <Grid columns={this.columns} data={data} />
      </ScrollWrapper>
    );
  }
}

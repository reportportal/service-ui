import React, { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { AbsRelTime } from 'components/main/absRelTime';
import { URLS } from 'common/urls';
import styles from './uniqueBugsTable.scss';
import {
  BUG_ID,
  BUG_ID_COLUMN_KEY,
  SUBMIT_DATE,
  SUBMIT_DATE_COLUMN_KEY,
  FOUND_IN,
  FOUND_IN_COLUMN_KEY,
  SUBMITTER,
  SUBMITTER_COLUMN_KEY,
} from './constants';

import { COLUMN_NAMES_MAP, hintMessages } from './messages';
import { FoundIn } from './foundIn';

export const cx = classNames.bind(styles);

const ColumnProps = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

const BugIDColumn = ({ className, value }) => (
  <div className={cx('bug-id-col', className)}>
    {value.url ? (
      <Link to={value.url} className={cx('bug-link')}>
        {value.bugID}
      </Link>
    ) : (
      value.bugID
    )}
  </div>
);
BugIDColumn.propTypes = ColumnProps;

const FoundInColumn = (props) => <FoundIn {...props} />;

const SubmitDateColumn = ({ className, value }, name, formatMessage) => (
  <div className={cx('submit-date-col', className)}>
    <span className={cx('mobile-hint')}>{formatMessage(hintMessages.submitDateHint)}</span>
    <AbsRelTime startTime={Number(value.submitDate)} />
  </div>
);
SubmitDateColumn.propTypes = ColumnProps;

const SubmitterColumn = ({ className, value }) => {
  const avatarUrl = URLS.dataPhoto(value.submitter, Date.now());

  return (
    <div className={cx('submitter-col', className)}>
      <div className={cx('avatar-wrapper')}>
        <img className={cx('avatar')} src={avatarUrl} alt="avatar" />
      </div>
      <div className={cx('submitter')}>{value.submitter}</div>
    </div>
  );
};
SubmitterColumn.propTypes = ColumnProps;

const columnComponentsMap = {
  [BUG_ID_COLUMN_KEY]: BugIDColumn,
  [FOUND_IN_COLUMN_KEY]: FoundInColumn,
  [SUBMIT_DATE_COLUMN_KEY]: SubmitDateColumn,
  [SUBMITTER_COLUMN_KEY]: SubmitterColumn,
};

const getColumn = (name, columnType, formatMessage) => ({
  id: name,
  title: COLUMN_NAMES_MAP[name],
  component: (data) => columnComponentsMap[columnType](data, name, formatMessage),
});

const COLUMNS_MAP = {
  [BUG_ID]: BUG_ID_COLUMN_KEY,
  [FOUND_IN]: FOUND_IN_COLUMN_KEY,
  [SUBMIT_DATE]: SUBMIT_DATE_COLUMN_KEY,
  [SUBMITTER]: SUBMITTER_COLUMN_KEY,
};

@injectIntl
export class UniqueBugsTable extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.columns = this.getColumns(props.intl.formatMessage);
  }

  getColumns = (formatMessage) => {
    const { widget } = this.props;
    const fieldsFromProps = widget.contentParameters.contentFields;

    return fieldsFromProps.reduce(
      (columns, item) =>
        COLUMNS_MAP[item]
          ? [...columns, getColumn(item, COLUMNS_MAP[item], formatMessage)]
          : columns,
      [],
    );
  };

  render() {
    const { result } = this.props.widget.content;

    return <Grid columns={this.columns} data={result} />;
  }
}

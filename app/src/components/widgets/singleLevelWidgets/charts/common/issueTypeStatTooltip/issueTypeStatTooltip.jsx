import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils/timeDateUtils';
import { TooltipContent } from '../../../../common/tooltip/tooltipContent';
import { getItemName } from '../../../../common/utils';
import styles from './issueTypeStatTooltip.scss';

const cx = classNames.bind(styles);

export const IssueTypeStatTooltip = ({
  itemName,
  startTime,
  color,
  issueStatNameProps,
  itemCases,
  wrapperClassName,
}) => {
  const issueStatName = issueStatNameProps.defectTypes
    ? getItemName(issueStatNameProps)
    : issueStatNameProps.itemName;

  return (
    <TooltipContent itemName={itemName} wrapperClassName={wrapperClassName}>
      {startTime && <div className={cx('start-time')}>{dateFormat(startTime)}</div>}
      <div>
        <span className={cx('color-mark')} style={{ backgroundColor: color }} />
        <span className={cx('issue-stat-name')}>{`${issueStatName}:`}</span>
        <span className={cx('item-cases')}>{itemCases}</span>
      </div>
    </TooltipContent>
  );
};
IssueTypeStatTooltip.propTypes = {
  color: PropTypes.string.isRequired,
  itemName: PropTypes.string,
  startTime: PropTypes.number,
  itemCases: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  issueStatNameProps: PropTypes.shape({
    itemName: PropTypes.string,
    defectTypes: PropTypes.object,
  }),
  wrapperClassName: PropTypes.string,
};
IssueTypeStatTooltip.defaultProps = {
  itemName: '',
  startTime: 0,
  itemCases: '',
  issueStatNameProps: {
    itemName: '',
    defectTypes: null,
  },
  wrapperClassName: '',
};

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { formatValue } from 'common/utils';
import styles from './timelineTooltip.scss';

const cx = classNames.bind(styles);

const Tooltip = ({ date, itemCases, color, itemName, integerValueType }) => {
  const itemCasesText = integerValueType ? itemCases : `${formatValue(itemCases)}%`;

  return (
    <React.Fragment>
      <div className={cx('launch-start-time')}>{date}</div>
      <div className={cx('item-wrapper')}>
        <span className={cx('color-mark')} style={{ backgroundColor: color }} />
        <span className={cx('item-name')}>{`${itemName}:`}</span>
        <span className={cx('item-cases')}>
          <span>{itemCasesText}</span>
        </span>
      </div>
    </React.Fragment>
  );
};

export const TimelineTooltip = (itemData, messages, intl, integerValueType) => (
  d,
  defaultTitleFormat,
  defaultValueFormat,
  color,
) => {
  const element = d[0];
  const item = itemData[element.index];
  const date = item.date || item;
  const { id } = element;

  return ReactDOMServer.renderToStaticMarkup(
    <Tooltip
      date={date}
      itemCases={d[0].value}
      color={color(id)}
      itemName={messages[id] ? intl.formatMessage(messages[id]) : id}
      integerValueType={integerValueType}
    />,
  );
};

Tooltip.propTypes = {
  date: PropTypes.string.isRequired,
  itemCases: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  itemName: PropTypes.string.isRequired,
  integerValueType: PropTypes.bool,
};

Tooltip.defaultProps = {
  integerValueType: false,
};

TimelineTooltip.propTypes = {
  itemData: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  integerValueType: PropTypes.bool,
};

TimelineTooltip.defaultProps = {
  integerValueType: false,
};

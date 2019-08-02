import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames/bind';
import ReactDOMServer from 'react-dom/server';
import Parser from 'html-react-parser';
import { DATETIME_FORMAT_TOOLTIP } from 'common/constants/timeDateFormat';
import TimeIcon from 'common/img/time-icon-inline.svg';
import { TooltipWrapper } from '../../charts/common/tooltip/tooltipWrapper/index';
import styles from './createMostTimeConsumingTooltipRenderer.scss';

const cx = classNames.bind(styles);

export const createMostTimeConsumingTooltipRenderer = (data) => (d) => {
  const { index: itemIndex } = d[0];
  const item = data[itemIndex];
  const { name, duration, startTime } = item;

  return ReactDOMServer.renderToStaticMarkup(
    <TooltipWrapper>
      <div className={cx('item-wrapper')}>
        <div className={cx('test-case-name')}>{`${name}`}</div>
        <div className={cx('time-wrapper')}>
          <span className={cx('time-icon')}>{Parser(TimeIcon)}</span>
          <span>{`${duration * 1000} ms`}</span>
        </div>
        <div>{moment(startTime).format(DATETIME_FORMAT_TOOLTIP)}</div>
      </div>
    </TooltipWrapper>,
  );
};

createMostTimeConsumingTooltipRenderer.propTypes = {
  data: PropTypes.object.isRequired,
};

createMostTimeConsumingTooltipRenderer.defaultProps = {
  data: {
    name: '',
    duration: 0,
    startTime: 0,
  },
};

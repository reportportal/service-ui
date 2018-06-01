import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { FormattedRelative } from 'react-intl';
import classNames from 'classnames/bind';
import { MarkdownViewer } from 'components/main/markdown';
import { DurationInfoBlock } from './durationInfoBlock';
import styles from './badgeInfoToolTip.scss';
import TagIcon from './img/tag-inline.svg';

const cx = classNames.bind(styles);

export const BadgeInfoToolTip = ({ data }) => (
  <React.Fragment>
    <div className={cx('title-block')}>
      <span>{data.name}</span>
    </div>
    <div className={cx('info-block')}>
      <DurationInfoBlock
        timing={{
          start: data.start_time,
          end: data.end_time,
        }}
      />
      <span className={cx('separator')} />
      <div className={cx('date-info')}>
        <FormattedRelative value={data.start_time} />
      </div>
      {data.tags && (
        <div className={cx('tags-info')}>
          <div className={cx('icon')}>{Parser(TagIcon)}</div>
          {data.tags.map((item) => (
            <span key={item} className={cx('tag-item')}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
    <MarkdownViewer value={data.description} />
  </React.Fragment>
);
BadgeInfoToolTip.propTypes = {
  data: PropTypes.object,
};
BadgeInfoToolTip.defaultProps = {
  data: {},
};

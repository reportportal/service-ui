import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { FormattedRelative } from 'react-intl';
import classNames from 'classnames/bind';
import { MarkdownViewer } from 'components/main/markdown';
import TagIcon from 'common/img/tag-inline.svg';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import styles from './itemInfoToolTip.scss';

const cx = classNames.bind(styles);

export const ItemInfoToolTip = ({ data }) => (
  <div className={cx('info-tooltip-wrapper')}>
    <div className={cx('title-block')}>
      <span>{data.name}</span>
    </div>
    <div className={cx('info-block')}>
      <DurationBlock
        timing={{
          start: data.startTime,
          end: data.endTime,
        }}
      />
      <span className={cx('separator')} />
      <div className={cx('date-info')}>
        <FormattedRelative value={data.startTime} />
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
  </div>
);
ItemInfoToolTip.propTypes = {
  data: PropTypes.object,
};
ItemInfoToolTip.defaultProps = {
  data: {},
};

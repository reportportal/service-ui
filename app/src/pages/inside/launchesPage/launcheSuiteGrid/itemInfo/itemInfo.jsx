import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { fromNowFormat } from 'common/utils';
import { MarkdownViewer } from 'components/main/markdown';
import { TagsBlock } from './tagsBlock';
import { OwnerBlock } from './ownerBlock';
import { DurationBlock } from './durationBlock';
import PencilIcon from './img/pencil-icon-inline.svg';
import styles from './itemInfo.scss';

const cx = classNames.bind(styles);

export const ItemInfo = ({ value, refFunction, analyzing }) => (
  <div ref={refFunction} className={cx('item-info')}>
    <div className={cx('main-info')}>
      <a href="/" className={cx('name-link')}>
        <span className={cx('name')}>{value.name}</span>
        <span className={cx('number')}>#{value.number}</span>
      </a>
      {
        analyzing && <div className={cx('analysis-badge')}>Analysis</div>
      }
      <div className={cx('edit-icon')}>
        { Parser(PencilIcon) }
      </div>
    </div>

    <div className={cx('additional-info')}>
      <DurationBlock
        type={value.type}
        status={value.status}
        itemNumber={value.number}
        timing={{
          start: value.start_time,
          end: value.end_time,
          approxTime: value.approximateDuration,
        }}
      />
      <div className={cx('mobile-start-time')}>
        { fromNowFormat(value.start_time) }
      </div>
      <OwnerBlock owner={value.owner} />
      {
        value.tags && value.tags.length && <TagsBlock tags={value.tags} />
      }
      {
        value.description &&
          <div className={cx('item-description')}>
            <MarkdownViewer value={value.description} />
          </div>
      }
    </div>
  </div>
);

ItemInfo.propTypes = {
  value: PropTypes.object,
  refFunction: PropTypes.func.isRequired,
  analyzing: PropTypes.bool,
};
ItemInfo.defaultProps = {
  value: {},
  analyzing: false,
};

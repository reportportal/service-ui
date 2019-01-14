import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Retries, RetriesContainer } from 'pages/inside/stepPage/retries';
import styles from './retriesBlock.scss';

const cx = classNames.bind(styles);

/*
We render invisible retries to allocate space for the absolute-positioned retries block.
It is necessary to overcome table limitations.
*/

export const RetriesBlock = forwardRef(({ testItemId, retries }, ref) => (
  <div className={cx('retries-block')} ref={ref}>
    <div className={cx('retries-hidden-block')}>
      <Retries retries={retries} testItemId={testItemId} selectedId={0} selectedIndex={0} />
    </div>
    <div className={cx('retries-visible-block')}>
      <RetriesContainer testItemId={testItemId} retries={retries} />
    </div>
  </div>
));
RetriesBlock.propTypes = {
  testItemId: PropTypes.number.isRequired,
  retries: PropTypes.arrayOf(PropTypes.object),
};

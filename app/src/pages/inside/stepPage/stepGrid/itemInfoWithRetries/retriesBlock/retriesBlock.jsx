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

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Retries, RetriesContainer } from 'pages/inside/stepPage/retries';
import styles from './retriesBlock.scss';

const cx = classNames.bind(styles);

const RIGHT_OFFSET = 20;

/*
We render invisible retries to allocate space for the absolute-positioned retries block.
It is necessary to overcome table limitations.
*/

export const RetriesBlock = ({ testItemId, retries, collapsed }) => {
  const blockRef = useRef(null);
  const visibleRef = useRef(null);

  useEffect(() => {
    const block = blockRef.current;
    const visible = visibleRef.current;
    // GridRow sets data-id={value.id} on grid-row-wrapper
    const row = block?.closest(`[data-id="${testItemId}"]`);
    if (!block || !visible || !row) {
      return undefined;
    }

    const updateWidth = () => {
      const width =
        row.getBoundingClientRect().right - block.getBoundingClientRect().left - RIGHT_OFFSET;
      visible.style.width = `${Math.max(Math.floor(width), 0)}px`;
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(row);

    return () => resizeObserver.disconnect();
  }, [testItemId, retries, collapsed]);

  return (
    <div className={cx('retries-block')} ref={blockRef}>
      <div className={cx('retries-hidden-block')}>
        <Retries
          retries={retries}
          testItemId={testItemId}
          selectedId={0}
          selectedIndex={0}
          collapsed={collapsed}
        />
      </div>
      <div className={cx('retries-visible-block')} ref={visibleRef}>
        <RetriesContainer testItemId={testItemId} retries={retries} collapsed={collapsed} />
      </div>
    </div>
  );
};
RetriesBlock.propTypes = {
  testItemId: PropTypes.number.isRequired,
  retries: PropTypes.arrayOf(PropTypes.object),
  collapsed: PropTypes.bool.isRequired,
};

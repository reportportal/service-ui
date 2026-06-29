/*
 * Copyright 2026 EPAM Systems
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

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './providerButtonsGrid.scss';

const cx = classNames.bind(styles);

export const ProviderButtonsGrid = ({ children }) => {
  const gridRef = useRef(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return undefined;
    }

    const updateHasScroll = () => setHasScroll(grid.scrollHeight > grid.clientHeight);

    updateHasScroll();

    const observer = new ResizeObserver(updateHasScroll);
    observer.observe(grid);

    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={gridRef} className={cx('provider-buttons', { 'with-scroll': hasScroll })}>
      {children}
    </div>
  );
};
ProviderButtonsGrid.propTypes = {
  children: PropTypes.node,
};
ProviderButtonsGrid.defaultProps = {
  children: null,
};

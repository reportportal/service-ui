/*
 * Copyright 2025 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import classNames from 'classnames/bind';
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { BubblesLoader } from '@reportportal/ui-kit';
import { ExtensionError } from '../extensionError';
import { extensionType } from '../extensionTypes';
import styles from './remoteExtensionLoader.scss';

const cx = classNames.bind(styles);

export function RemoteExtensionLoader({ extension }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const src = DOMPurify.sanitize(new URL(extension.payload.url, extension.url));

  const onLoad = () => {
    setIsLoaded(true);
  };

  const onError = () => {
    setHasError(true);
  };

  return (
    <div className={cx('remote-extension-loader')}>
      {!isLoaded && !hasError && <BubblesLoader />}
      {hasError && <ExtensionError />}
      <iframe
        name={extension.pluginName}
        title={extension.pluginName}
        src={src}
        className={cx('remote-extension-loader')}
        onLoad={onLoad}
        onError={onError}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-popups"
      />
    </div>
  );
}
RemoteExtensionLoader.propTypes = {
  extension: extensionType.isRequired,
};

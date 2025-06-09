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

import React, { useRef, useState } from 'react';
import { extensionType } from '../extensionTypes';

export function RemoteExtensionLoader({ extension }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const src = `${extension.url}${extension.payload.url}`;

  const ref = useRef();

  const onLoad = () => {
    setIsLoaded(true);
  };

  const onError = () => {
    setHasError(true);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!isLoaded && !hasError && <div>Загрузка расширения…</div>}
      {hasError && <div>Ошибка загрузки расширения</div>}
      <iframe
        ref={ref}
        name={extension.pluginName}
        title={extension.pluginName}
        src={src}
        style={{ width: '100%', height: '100%' }}
        onLoad={onLoad}
        onError={onError}
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
RemoteExtensionLoader.propTypes = {
  extension: extensionType.isRequired,
};

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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo, useCallback } from 'react';

export const useExtensionsConfig = ({
  extensions,
  createTabLink,
  setHeaderNodes,
  getEventInfo,
  ExtensionLoaderComponent,
}) => {
  const extensionsConfig = useMemo(() => {
    return extensions.reduce((acc, extension) => {
      const { name, payload } = extension;
      const title = payload.title || payload.name;
      const config = {
        name: title,
        link: createTabLink(name, payload.initialPage?.payload, payload.initialPage?.type),
        component: (
          <ExtensionLoaderComponent
            extension={extension}
            withPreloader
            silentOnError={false}
            setHeaderNodes={setHeaderNodes}
          />
        ),
        mobileDisabled: true,
      };

      if (getEventInfo) {
        config.eventInfo = getEventInfo(title);
      }

      return {
        ...acc,
        [name]: config,
      };
    }, {});
  }, [createTabLink, extensions, setHeaderNodes, getEventInfo]);

  const mergeConfig = useCallback(
    (navConfig) => {
      const navConfigCopy = { ...navConfig };
      const extensionsConfigCopy = { ...extensionsConfig };
      Object.keys(extensionsConfigCopy).forEach((key) => {
        if (navConfigCopy[key]) {
          navConfigCopy[key] = {
            ...navConfigCopy[key],
            component: extensionsConfigCopy[key].component,
          };
          delete extensionsConfigCopy[key];
        }
      });
      return { ...navConfigCopy, ...extensionsConfigCopy };
    },
    [extensionsConfig],
  );

  return { extensionsConfig, mergeConfig };
};

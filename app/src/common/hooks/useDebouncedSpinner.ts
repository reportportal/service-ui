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

import { useState, useRef } from 'react';

import { debounce } from 'common/utils';
import { SPINNER_DEBOUNCE } from 'pages/inside/common/constants';

export const useDebouncedSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const cancelDebouncedSetLoading = useRef<VoidFunction>(null);

  const debouncedSetLoading = debounce(() => setIsLoading(true), SPINNER_DEBOUNCE);

  const showSpinner = () => {
    cancelDebouncedSetLoading.current = debouncedSetLoading();
  };

  const hideSpinner = () => {
    if (cancelDebouncedSetLoading.current) {
      cancelDebouncedSetLoading.current();
      cancelDebouncedSetLoading.current = null;
    }

    setIsLoading(false);
  };

  return {
    isLoading,
    showSpinner,
    hideSpinner,
  };
};

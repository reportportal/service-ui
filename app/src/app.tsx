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

import { LocalizationContainer } from 'components/containers/localizationContainer';
import { InitialDataContainer } from 'components/containers/initialDataContainer';
import PageSwitcher from 'routes/pageSwitcher';
import { FC } from 'react';

interface AppProps {
  initialDispatch: () => void;
}

const App: FC<AppProps> = ({ initialDispatch }) => (
  <InitialDataContainer initialDispatch={initialDispatch}>
    <LocalizationContainer>
      <PageSwitcher />
    </LocalizationContainer>
  </InitialDataContainer>
);

export default App;

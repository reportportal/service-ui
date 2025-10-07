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

import PropTypes from 'prop-types';
import { Layout } from 'layouts/common/layout';
import { AppHeader } from './appHeader';
import { AppSidebar } from './appSidebar';
import { AppBanner } from './appBanner';

export const AppLayout = ({ children, rawContent }) => (
  <Layout Header={AppHeader} Sidebar={AppSidebar} Banner={AppBanner} rawContent={rawContent}>
    {children}
  </Layout>
);

AppLayout.propTypes = {
  children: PropTypes.node,
  rawContent: PropTypes.bool,
};
AppLayout.defaultProps = {
  children: null,
  rawContent: false,
};

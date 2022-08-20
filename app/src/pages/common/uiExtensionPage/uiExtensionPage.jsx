/*
 * Copyright 2020 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { PageLayout, PageSection, PageHeader } from 'layouts/pageLayout';
import { ExtensionLoader, extensionType } from 'components/extensionLoader';

export const UiExtensionPage = ({ extensions, activePluginPage }) => {
  const extension = React.useMemo(() => extensions.find((ex) => ex.name === activePluginPage), [
    extensions,
    activePluginPage,
  ]);

  return (
    <PageLayout>
      {extension && <PageHeader breadcrumbs={[{ title: extension.title || extension.name }]} />}
      <PageSection>
        <ExtensionLoader extension={extension} withPreloader />
      </PageSection>
    </PageLayout>
  );
};
UiExtensionPage.propTypes = {
  extensions: PropTypes.arrayOf(extensionType),
  activePluginPage: PropTypes.string,
};
UiExtensionPage.defaultProps = {
  extensions: [],
  activePluginPage: null,
};

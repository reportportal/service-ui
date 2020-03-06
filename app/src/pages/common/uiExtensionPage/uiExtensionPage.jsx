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

import PropTypes from 'prop-types';
import { PageLayout, PageSection, PageHeader } from 'layouts/pageLayout';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';

export const UiExtensionPage = ({ extensions, activePluginPage, isExtensionsLoaded }) => {
  const extension = extensions.find((ex) => ex.name === activePluginPage);
  let component;
  if (!isExtensionsLoaded) {
    component = <SpinningPreloader />;
  } else if (isExtensionsLoaded && extension && extension.component) {
    component = extension.component;
  } else {
    component = <div>Plugin not found</div>;
  }

  return (
    <PageLayout>
      {extension && <PageHeader breadcrumbs={[{ title: extension.title || extension.name }]} />}
      <PageSection>{component}</PageSection>
    </PageLayout>
  );
};
UiExtensionPage.propTypes = {
  extensions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      title: PropTypes.string,
      component: PropTypes.element,
    }),
  ),
  activePluginPage: PropTypes.string,
  isExtensionsLoaded: PropTypes.bool,
};
UiExtensionPage.defaultProps = {
  extensions: [],
  activePluginPage: null,
  isExtensionsLoaded: false,
};

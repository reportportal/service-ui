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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { createExternalLink, docsReferences } from 'common/utils';
import OpenInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { NumerableBlock } from 'pages/common/numerableBlock';
import { VariablesAndDatasets } from './variablesAndDatasets';
import { FormattedDescription, TabDescription } from '../../../content/elements';
import { SettingsPageContent } from '../../settingsPageContent';
import { HeaderControls } from './headerControls';
import { messages } from './messages';
import styles from './testData.scss';

const cx = classNames.bind(styles);

export const TestData = ({ setHeaderTitleNode }) => {
  const { formatMessage } = useIntl();

  useEffect(() => {
    setHeaderTitleNode(<HeaderControls />);

    return () => setHeaderTitleNode(null);
  });

  const howToGetStartedItems = [
    messages.createList,
    messages.createDataset,
    messages.linkEnvironments,
  ].map((translation) =>
    formatMessage(translation, {
      b: (chunks) => <strong>{chunks}</strong>,
      br: <br />,
    }),
  );

  return (
    <SettingsPageContent>
      <TabDescription>
        <FormattedDescription
          content={formatMessage(messages.tabDescription, {
            a: (data) =>
              createExternalLink(
                data,
                // TODO: Update link
                docsReferences.workWithReports,
                'documentationLink',
                OpenInNewTabIcon,
              ),
          })}
        />
      </TabDescription>
      <VariablesAndDatasets />
      <NumerableBlock
        title={formatMessage(messages.howToGetStarted)}
        items={howToGetStartedItems}
        className={cx('test-data-page__how-to-get-started')}
        fullWidth
      />
    </SettingsPageContent>
  );
};

TestData.propTypes = {
  setHeaderTitleNode: PropTypes.func.isRequired,
};

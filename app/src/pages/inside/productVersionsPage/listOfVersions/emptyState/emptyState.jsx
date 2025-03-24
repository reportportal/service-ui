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

import React from 'react';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { NumerableBlock } from 'pages/common/numerableBlock';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { EmptyStatePage } from 'pages/inside/projectSettingsPageContainer/content/emptyStatePage';

import { messages as parentMessage } from '../../messages';
import { messages } from './messages';

export const EmptyState = ({ openCreateProductVersionModal }) => {
  const { formatMessage } = useIntl();

  const benefits = [
    messages.emptyPageFirstBenefit,
    messages.emptyPageSecondBenefit,
    messages.emptyPageThirdBenefit,
  ].map((translation) =>
    formatMessage(translation, {
      strong: (chunks) => <strong>{chunks}</strong>,
    }),
  );

  return (
    <>
      <EmptyStatePage
        title={formatMessage(messages.emptyPageTitle)}
        description={Parser(formatMessage(messages.emptyPageDescription))}
        buttonName={formatMessage(parentMessage.addProductVersionButtonText)}
        buttonIcon={PlusIcon}
        imageType="branches"
        buttonDataAutomationId="addProductVersionButton"
        handleButton={openCreateProductVersionModal}
      />
      <NumerableBlock
        items={benefits}
        title={formatMessage(messages.numerableBlockTitle)}
        fullWidth
      />
    </>
  );
};

EmptyState.propTypes = {
  openCreateProductVersionModal: PropTypes.func.isRequired,
};

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
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { hideModalAction, showModalAction } from 'controllers/modal';
import classNames from 'classnames/bind';

import { Button } from '@reportportal/ui-kit';
import plusIcon from 'common/img/plus-button-inline.svg';
import { Dataset, datasetShape } from './dataset';
import { InfoBlockWithControl } from '../../../elements/infoBlockWithControl';
import { CREATE_DATASET_MODAL_KEY } from './createDatasetModal';
import styles from './datasets.scss';

const cx = classNames.bind(styles);

export const messages = defineMessages({
  noDatasetsCreatedYet: {
    id: 'TestData.noDatasetsCreatedYet',
    defaultMessage: 'No datasets created yet. Create a new one and start adding values.',
  },
  createDataset: {
    id: 'TestData.createDataset',
    defaultMessage: 'Create Dataset',
  },
  noVariablesAvailable: {
    id: 'TestData.noVariablesAvailable',
    defaultMessage:
      'No values currently available. Please add at least one variable to get started.',
  },
});

export const Datasets = ({ datasets, variables, onDatasetAdd }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const handleModalSubmit = (data) => {
    onDatasetAdd(data);

    dispatch(hideModalAction());
  };

  const openCreateDatasetModal = () => {
    dispatch(
      showModalAction({
        id: CREATE_DATASET_MODAL_KEY,
        data: {
          onSubmit: handleModalSubmit,
        },
      }),
    );
  };

  return datasets.length === 0 ? (
    <div className={cx('datasets__empty-state')}>
      <InfoBlockWithControl
        label={formatMessage(messages.noDatasetsCreatedYet)}
        control={
          <Button variant="text" icon={Parser(plusIcon)} onClick={openCreateDatasetModal}>
            {formatMessage(messages.createDataset)}
          </Button>
        }
      />
    </div>
  ) : (
    <div className={cx('datasets__wrapper')}>
      <div className={cx('datasets__list')}>
        {datasets.map((dataset) => (
          <Dataset dataset={dataset} key={dataset.datasetName} />
        ))}
      </div>
      {variables.length === 0 && (
        <div className={cx('datasets__no-variables-message')}>
          {formatMessage(messages.noVariablesAvailable)}
        </div>
      )}
    </div>
  );
};

Datasets.propTypes = {
  datasets: PropTypes.arrayOf(datasetShape).isRequired,
  variables: PropTypes.array.isRequired,
  onDatasetAdd: PropTypes.func.isRequired,
};

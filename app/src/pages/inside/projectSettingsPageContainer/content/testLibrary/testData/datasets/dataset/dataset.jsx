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

import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import {
  Button,
  DeleteIcon,
  EditIcon,
  FlagIcon,
  ExportIcon,
  PlusIcon,
  ChevronDownDropdownIcon,
} from '@reportportal/ui-kit';
import { messages as datasetsMessages } from '../datasets';
import styles from './dataset.scss';

const cx = classNames.bind(styles);

export const datasetShape = PropTypes.shape({
  datasetName: PropTypes.string,
  timestamp: PropTypes.object,
  username: PropTypes.string,
});

const messages = defineMessages({
  createdBy: {
    id: 'testData.createdBy',
    defaultMessage: 'Created by {username} on {date} at {time}',
  },
});

export const Dataset = ({ dataset: { datasetName, timestamp, username } }) => {
  const { formatMessage, formatDate, formatTime } = useIntl();

  return (
    <div className={cx('dataset__wrapper')}>
      <div className={cx('dataset__name-tools-wrapper')}>
        <div>
          <div className={cx('dataset__name')}>
            <FlagIcon />
            {datasetName}
            <ChevronDownDropdownIcon />
          </div>
          <div className={cx('dataset__timestamp')}>
            {formatMessage(messages.createdBy, {
              username,
              date: formatDate(timestamp),
              time: formatTime(timestamp),
            })}
          </div>
        </div>
        <div className={cx('dataset__controls-wrapper')}>
          <Button variant="text">
            <EditIcon />
          </Button>
          <Button variant="text">
            <ExportIcon />
          </Button>
          <Button variant="text">
            <DeleteIcon />
          </Button>
        </div>
      </div>
      <div className={cx('dataset__create-dataset-wrapper')}>
        <Button variant="text" icon={<PlusIcon />}>
          {formatMessage(datasetsMessages.createDataset)}
        </Button>
      </div>
    </div>
  );
};

Dataset.propTypes = {
  dataset: datasetShape.isRequired,
};

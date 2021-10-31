/*
 * Copyright 2021 EPAM Systems
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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Grid } from 'components/main/grid';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import styles from './uniqueErrorsGrid.scss';

const cx = classNames.bind(styles);

const ExpandColumn = ({ className }) => <div className={cx('expand-col', className)} />;
ExpandColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

const ClusterColumn = ({ className, ...rest }) => (
  <div className={cx(className)}>
    <StackTraceMessageBlock
      level={'error'}
      maxHeight={75}
      customProps={{
        rowWrapper: cx('row-wrapper'),
        row: cx('row'),
        accordionBlock: cx('accordion-block'),
      }}
    >
      <div>{rest.value.message}</div>
    </StackTraceMessageBlock>
  </div>
);
ClusterColumn.propTypes = {
  className: PropTypes.string.isRequired,
};

export const UniqueErrorsGrid = ({ data, loading }) => {
  const getColumns = () => [
    {
      id: 'expand',
      title: {
        full: '',
      },
      component: ExpandColumn,
      customProps: {
        gridHeaderCellStyles: cx('expand-col'),
      },
    },
    {
      id: 'error',
      title: {
        full: 'ERROR LOG',
        short: 'ERROR LOG',
      },
      component: ClusterColumn,
      customProps: {
        gridHeaderCellStyles: cx('cluster-header'),
        gridCellStyles: cx('reset-padding'),
      },
    },
  ];

  return <Grid columns={getColumns()} data={data} loading={loading} />;
};
UniqueErrorsGrid.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
};
UniqueErrorsGrid.defaultProps = {
  data: [],
  loading: false,
};

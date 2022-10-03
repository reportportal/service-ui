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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import {
  nestedStepSelector,
  requestNestedStepAction,
  isLoadMoreButtonVisible,
  loadMoreNestedStepAction,
  isLoadPreviousButtonVisible,
  isLoadCurrentStepButtonVisible,
  fetchCurrentStepAction,
} from 'controllers/log/nestedSteps';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NEXT, PREVIOUS } from 'controllers/log';
import DoubleArrow from 'common/img/double-arrow-inline.svg';
import LoadList from 'common/img/list-full-inline.svg';
import { NestedGridBody } from '../nestedGridBody';
import styles from './nestedGridRow.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loadPreviousLabel: {
    id: 'NestedGridRow.loadPreviousLabel',
    defaultMessage: 'Load previous 300',
  },
  loadLabel: {
    id: 'NestedGridRow.loadLabel',
    defaultMessage: 'Load next 300',
  },
  loadCurrentStep: {
    id: 'NestedGridRow.loadCurrentStep',
    defaultMessage: 'Load current step',
  },
});

const RowMore = ({ level, children }) => (
  <td
    colSpan="100"
    className={cx('row-more', {
      [`level-${level + 1}`]: level + 1 !== 0,
    })}
  >
    <div className={cx('row-more-container')}>{children}</div>
  </td>
);
RowMore.propTypes = {
  level: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

const LoadButton = ({ loading, clickHandler, label, icon, iconClassName }) => (
  <div
    className={cx('load-button', { loading })}
    onClick={(e) => {
      e.stopPropagation();
      clickHandler();
    }}
  >
    <i className={cx('icon', iconClassName)}>{Parser(icon)}</i>
    <span className={cx('button-label')}>{label}</span>
  </div>
);
LoadButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  clickHandler: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  iconClassName: PropTypes.string,
};
LoadButton.defaultProps = {
  iconClassName: '',
};

export const NestedGridRow = ({
  data,
  level,
  data: { id },
  nestedStepHeader: NestedStepHeader,
  ...rest
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { collapsed, loading, content, page } = useSelector((state) =>
    nestedStepSelector(state, id),
  );
  const showPreviousButton = isLoadPreviousButtonVisible(page);
  const showMoreButton = isLoadMoreButtonVisible(page);
  const showLoadCurrentStepButton = isLoadCurrentStepButtonVisible(page);
  const requestStep = () => {
    dispatch(requestNestedStepAction({ id }));
  };
  const loadMore = (loadDirection) => {
    dispatch(loadMoreNestedStepAction({ id, loadDirection }));
  };
  const loadCurrentStepButton = (
    <LoadButton
      loading={loading}
      clickHandler={() => dispatch(fetchCurrentStepAction({ id }))}
      label={formatMessage(messages.loadCurrentStep)}
      icon={LoadList}
    />
  );

  return (
    <>
      <NestedStepHeader
        data={data}
        collapsed={collapsed}
        loading={collapsed && loading}
        onToggle={requestStep}
        level={level}
        additionalNameCellBlock={showLoadCurrentStepButton && loadCurrentStepButton}
      />
      {!collapsed && (
        <>
          {showPreviousButton && (
            <RowMore level={level}>
              <LoadButton
                loading={loading}
                clickHandler={() => loadMore(PREVIOUS)}
                label={formatMessage(messages.loadPreviousLabel)}
                icon={DoubleArrow}
                iconClassName={cx('rotate-icon')}
              />
              {loadCurrentStepButton}
              {loading && (
                <div className={cx('loading-icon')}>
                  <SpinningPreloader />
                </div>
              )}
            </RowMore>
          )}
          <NestedGridBody
            data={content}
            level={level + 1}
            nestedStepHeader={NestedStepHeader}
            {...rest}
          />
          {showMoreButton && (
            <RowMore level={level}>
              <LoadButton
                loading={loading}
                clickHandler={() => loadMore(NEXT)}
                label={formatMessage(messages.loadLabel)}
                icon={DoubleArrow}
              />
              {loadCurrentStepButton}
              {loading && (
                <div className={cx('loading-icon')}>
                  <SpinningPreloader />
                </div>
              )}
            </RowMore>
          )}
        </>
      )}
    </>
  );
};

NestedGridRow.propTypes = {
  data: PropTypes.object,
  level: PropTypes.number,
  nestedStepHeader: PropTypes.elementType.isRequired,
};
NestedGridRow.defaultProps = {
  data: {},
  level: 0,
};

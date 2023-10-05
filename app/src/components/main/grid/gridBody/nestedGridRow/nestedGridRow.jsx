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
import track from 'react-tracking';
import Parser from 'html-react-parser';
import {
  nestedStepsSelector,
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
import { NestedGridBody } from 'components/main/grid/gridBody/nestedGridBody';
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

const LoadButton = ({ loading, clickHandler, label, icon, iconClassName, customClassName }) => (
  <div
    className={cx('load-button', { loading }, customClassName)}
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
  customClassName: PropTypes.string,
};
LoadButton.defaultProps = {
  iconClassName: '',
  customClassName: '',
};

// The circular dependency will not be fixed because there is a direct dependency of this component on NestedGridBody.

export const NestedGridRow = track()(
  ({ tracking, data, level, data: { id }, nestedStepHeader: NestedStepHeader, ...rest }) => {
    const { eventsInfo = {} } = rest;
    const dispatch = useDispatch();
    const { formatMessage } = useIntl();
    const { collapsed, loading, content, page } = useSelector((state) =>
      nestedStepSelector(state, id),
    );
    const allNestedStepsData = useSelector(nestedStepsSelector);
    const showPreviousButton = isLoadPreviousButtonVisible(page);
    const showMoreButton = isLoadMoreButtonVisible(page);
    const showLoadCurrentStepButton = isLoadCurrentStepButtonVisible(
      page,
      data,
      allNestedStepsData,
    );
    const [itemIntoViewId, setItemIntoViewId] = React.useState(null);
    const [direction, setDirection] = React.useState(null);
    const itemIntoViewRef = React.useRef(null);

    const calculateFirstRowIdOnLoadPreviousClick = (contentItems) => {
      const isStep = (item) => 'hasContent' in item;
      setItemIntoViewId((contentItems.find((item) => !isStep(item)) || {}).id);
    };

    const scrollToPreviousViewAndResetRef = () => {
      itemIntoViewRef.current.scrollIntoView({ block: 'center' });
      itemIntoViewRef.current = null;
    };

    React.useEffect(() => {
      if (direction) {
        calculateFirstRowIdOnLoadPreviousClick(content);
        setDirection(null);
      } else if (!loading && itemIntoViewRef.current) {
        scrollToPreviousViewAndResetRef();
        setItemIntoViewId(null);
      }
    }, [loading]);

    const requestStep = () => {
      dispatch(requestNestedStepAction({ id }));
    };
    const loadMore = (loadDirection) => {
      tracking.trackEvent(eventsInfo.getClickOnLoadMore(loadDirection));

      if (loadDirection === PREVIOUS) {
        setDirection(loadDirection);
      }

      dispatch(loadMoreNestedStepAction({ id, loadDirection }));
    };
    const loadCurrentStep = () => {
      tracking.trackEvent(eventsInfo.clickOnLoadCurrentStep);

      dispatch(fetchCurrentStepAction({ id }));
    };
    const loadCurrentStepButton = (
      <LoadButton
        loading={loading}
        clickHandler={loadCurrentStep}
        label={formatMessage(messages.loadCurrentStep)}
        icon={LoadList}
      />
    );

    const additionalNameCellBlockButton = (
      <LoadButton
        customClassName={cx('overflowed-button', { 'overflowed-button-collapsed-view': collapsed })}
        loading={loading}
        clickHandler={loadCurrentStep}
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
          additionalNameCellBlock={showLoadCurrentStepButton && additionalNameCellBlockButton}
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
              itemIntoViewRef={itemIntoViewRef}
              itemIntoViewId={itemIntoViewId}
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
  },
);

NestedGridRow.propTypes = {
  data: PropTypes.object,
  level: PropTypes.number,
  nestedStepHeader: PropTypes.elementType.isRequired,
};
NestedGridRow.defaultProps = {
  data: {},
  level: 0,
};

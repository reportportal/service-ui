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

import { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  nestedStepSelector,
  requestNestedStepAction,
  isLoadMoreButtonVisible,
  loadMoreNestedStepAction,
} from 'controllers/log/nestedSteps';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NestedGridBody } from '../nestedGridBody';
import styles from './nestedGridRow.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loadLabel: {
    id: 'NestedGridRow.loadLabel',
    defaultMessage: 'Load 10 more',
  },
});

export const NestedGridRow = injectIntl(
  connect(
    (state, ownProps) => ({
      nestedStep: nestedStepSelector(state, ownProps.data.id),
    }),
    {
      requestNestedStep: requestNestedStepAction,
      loadMoreNestedStep: loadMoreNestedStepAction,
    },
  )(
    ({
      data,
      nestedStep,
      level,
      data: { id },
      nestedStepHeader: NestedStepHeader,
      requestNestedStep,
      loadMoreNestedStep,
      intl,
      ...rest
    }) => {
      const showMoreButton = isLoadMoreButtonVisible(nestedStep);
      const { collapsed, loading, content } = nestedStep;
      const requestStep = () => {
        requestNestedStep({ id });
      };
      const loadMore = () => {
        loadMoreNestedStep({ id });
      };
      return (
        <Fragment>
          <NestedStepHeader
            data={data}
            collapsed={collapsed}
            loading={collapsed && loading}
            onToggle={requestStep}
            level={level}
          />
          {!collapsed && (
            <Fragment>
              <NestedGridBody
                data={content}
                level={level + 1}
                nestedStepHeader={NestedStepHeader}
                {...rest}
              />
              {showMoreButton && (
                <td
                  colSpan="100"
                  className={cx('row-more', {
                    [`level-${level + 1}`]: level + 1 !== 0,
                  })}
                >
                  <div
                    className={cx('row-more-container', {
                      loading,
                    })}
                    onClick={loadMore}
                  >
                    <div className={cx('row-more-label')}>
                      {intl.formatMessage(messages.loadLabel)}
                    </div>
                    {loading && (
                      <div className={cx('loading-icon')}>
                        <SpinningPreloader />
                      </div>
                    )}
                  </div>
                </td>
              )}
            </Fragment>
          )}
        </Fragment>
      );
    },
  ),
);

NestedGridRow.propTypes = {
  data: PropTypes.object,
  nestedStep: PropTypes.func,
  requestNestedStep: PropTypes.func,
  level: PropTypes.number,
  nestedStepHeader: PropTypes.elementType.isRequired,
};
NestedGridRow.defaultProps = {
  data: {},
  nestedStep: () => {},
  requestNestedStep: () => {},
  level: 0,
};

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

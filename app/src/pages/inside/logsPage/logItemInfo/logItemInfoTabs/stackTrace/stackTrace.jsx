import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { dateFormat } from 'common/utils';
import {
  logStackTraceItemsSelector,
  logStackTraceLoadingSelector,
  fetchLogPageStackTrace,
  isLoadMoreStackTraceVisible,
} from 'controllers/log';
import styles from './stackTrace.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  messageRefCaption: {
    id: 'StackTrace.messageRefCaption',
    defaultMessage: 'Go to stack trace in log message',
  },
  noStackTrace: {
    id: 'StackTrace.noStackTrace',
    defaultMessage: 'No stack trace to display',
  },
  loadLabel: {
    id: 'StackTrace.loadLabel',
    defaultMessage: 'Load more',
  },
});

@connect(
  (state) => ({
    items: logStackTraceItemsSelector(state),
    loading: logStackTraceLoadingSelector(state),
    loadMore: isLoadMoreStackTraceVisible(state),
  }),
  {
    fetchItems: fetchLogPageStackTrace,
  },
)
@injectIntl
export class StackTrace extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    items: PropTypes.array,
    loading: PropTypes.bool,
    fetchItems: PropTypes.func,
    loadMore: PropTypes.bool,
  };

  static defaultProps = {
    items: [],
    loading: false,
    fetchItems: () => {},
    loadMore: false,
  };

  componentDidMount() {
    const { fetchItems } = this.props;
    if (this.isItemsExist()) {
      return;
    }
    fetchItems();
  }
  isItemsExist = () => {
    const { items } = this.props;
    return items.length;
  };
  renderStackTraceMessage = () => {
    const { items, loadMore, fetchItems, loading, intl } = this.props;
    return (
      <React.Fragment>
        <ScrollWrapper autoHeight autoHeightMax={300}>
          <table>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={cx('row')}>
                  <td className={cx('cell', 'message-cell')}>{item.message}</td>
                  <td className={cx('cell', 'time-cell')}>{dateFormat(item.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollWrapper>
        {loadMore && (
          <div
            className={cx('load-more-container', {
              loading,
            })}
          >
            <div className={cx('load-more-label')} onClick={fetchItems}>
              {intl.formatMessage(messages.loadLabel)}
            </div>
            {loading && (
              <div className={cx('loading-icon')}>
                <SpinningPreloader />
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  renderStackTrace = () => {
    const { intl, loading } = this.props;

    if (loading && !this.isItemsExist()) {
      return <SpinningPreloader />;
    }
    if (this.isItemsExist()) {
      return this.renderStackTraceMessage();
    }
    return <NoItemMessage message={intl.formatMessage(messages.noStackTrace)} />;
  };

  render() {
    return <div className={cx('stack-trace')}>{this.renderStackTrace()}</div>;
  }
}

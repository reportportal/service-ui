import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ItemNameBlock } from './itemNameBlock';
import styles from './historyNamesGrid.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  itemNamesHeaderTitle: {
    id: 'HistoryTable.itemNamesHeaderTitle',
    defaultMessage: 'Name',
  },
});

@injectIntl
export class HistoryNamesGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    items: PropTypes.array,
    customClass: PropTypes.string,
  };

  static defaultProps = {
    items: [],
    customClass: '',
  };

  render() {
    const { intl, customClass, items } = this.props;

    return (
      <div className={cx('history-names-grid-wrapper', customClass)}>
        <div className={cx('history-grid-head')}>
          <div className={cx('history-grid-header-column')}>
            <span>{intl.formatMessage(messages.itemNamesHeaderTitle)}</span>
          </div>
        </div>
        {items.map((item) => (
          <div key={item.uniqueId} className={cx('history-grid-row')}>
            <div className={cx('history-grid-column')}>
              <ItemNameBlock data={item} />
            </div>
          </div>
        ))}
      </div>
    );
  }
}

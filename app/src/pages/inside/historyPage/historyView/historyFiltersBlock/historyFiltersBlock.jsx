import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { HISTORY_DEPTH_CONFIG } from 'controllers/itemsHistory';
import styles from './historyFiltersBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  depthFilterTitle: {
    id: 'HistoryFiltersBlock.depthFilterTitle',
    defaultMessage: 'History depth',
  },
});

@injectIntl
export class HistoryFiltersBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    historyDepth: PropTypes.string,
    onChangeHistoryDepth: PropTypes.func,
  };

  static defaultProps = {
    historyDepth: HISTORY_DEPTH_CONFIG.defaultValue,
    onChangeHistoryDepth: () => {},
  };

  render() {
    const { intl, historyDepth, onChangeHistoryDepth } = this.props;

    return (
      <div className={cx('filters-block-wrapper')}>
        <p className={cx('filter-name')}>{intl.formatMessage(messages.depthFilterTitle)}</p>
        <div className={cx('drop-down-container')}>
          <InputDropdown
            options={HISTORY_DEPTH_CONFIG.options}
            customClass={cx('mobile-input-disabled')}
            value={historyDepth}
            onChange={onChangeHistoryDepth}
          />
        </div>
      </div>
    );
  }
}

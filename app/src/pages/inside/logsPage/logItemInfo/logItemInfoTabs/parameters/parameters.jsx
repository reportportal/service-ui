import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './parameters.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noParameters: {
    id: 'Parameters.noParameters',
    defaultMessage: 'No parameters to display',
  },
  keyHeader: {
    id: 'Parameters.keyHeader',
    defaultMessage: 'Parameter key',
  },
  valueHeader: {
    id: 'Parameters.valueHeader',
    defaultMessage: 'Parameter value',
  },
});

@injectIntl
export class Parameters extends Component {
  static propTypes = {
    logItem: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
  };

  renderParametersGrid = (parameters) => (
    <div className={cx('parameters-grid')}>
      <div className={cx('header-row')}>
        <div className={cx('parameters-column')}>
          {this.props.intl.formatMessage(messages.keyHeader)}
        </div>
        <div className={cx('parameters-column')}>
          {this.props.intl.formatMessage(messages.valueHeader)}
        </div>
      </div>
      {parameters.map((item, index) => (
        <div
          key={`${item.key}_${index}`} // eslint-disable-line react/no-array-index-key
          className={cx('parameters-row')}
        >
          <div className={cx('parameters-column')}>{item.key}</div>
          <div className={cx('parameters-column')}>{item.value}</div>
        </div>
      ))}
    </div>
  );

  render() {
    const { logItem, intl } = this.props;

    return logItem.parameters && logItem.parameters.length ? (
      <div className={cx('parameters')}>
        <ScrollWrapper autoHeight autoHeightMax={105} hideTracksWhenNotNeeded>
          {this.renderParametersGrid(logItem.parameters)}
        </ScrollWrapper>
      </div>
    ) : (
      <NoItemMessage message={intl.formatMessage(messages.noParameters)} />
    );
  }
}

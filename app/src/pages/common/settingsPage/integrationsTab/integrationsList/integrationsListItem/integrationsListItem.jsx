import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { INTEGRATIONS_IMAGES_MAP } from './constants';
import styles from './integrationsListItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class IntegrationsListItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    item: PropTypes.object.isRequired,
  };

  render() {
    const { item } = this.props;

    return (
      <div className={cx('integrations-list-item')}>
        <img
          className={cx('integration-image')}
          src={INTEGRATIONS_IMAGES_MAP[item.integrationType.name]}
          alt={item.integrationType.name}
        />
        <div className={cx('integration-info-block')}>
          <span className={cx('integration-name')}>{item.integrationType.name}</span>
          <span className={cx('plugin-author')}>{`by ${item.integrationType.uploadedBy}`}</span>
        </div>
      </div>
    );
  }
}

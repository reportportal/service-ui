import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { INTEGRATIONS_IMAGES_MAP, INTEGRATION_NAMES_TITLES } from 'components/integrations';
import styles from './integrationsListItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class IntegrationsListItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    integrationType: PropTypes.object.isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    onClick: () => {},
  };

  itemClickHandler = () => this.props.onClick(this.props.integrationType);

  render() {
    const {
      integrationType: { name, uploadedBy },
    } = this.props;

    return (
      <div className={cx('integrations-list-item')} onClick={this.itemClickHandler}>
        <img className={cx('integration-image')} src={INTEGRATIONS_IMAGES_MAP[name]} alt={name} />
        <div className={cx('integration-info-block')}>
          <span className={cx('integration-name')}>{INTEGRATION_NAMES_TITLES[name] || name}</span>
          <span className={cx('plugin-author')}>{`by ${uploadedBy || 'Report Portal'}`}</span>
        </div>
      </div>
    );
  }
}

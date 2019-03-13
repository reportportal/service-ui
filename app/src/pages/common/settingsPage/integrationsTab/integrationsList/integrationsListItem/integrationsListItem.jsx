import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { INTEGRATIONS_IMAGES_MAP } from 'components/integrations';
import styles from './integrationsListItem.scss';

const cx = classNames.bind(styles);

@injectIntl
export class IntegrationsListItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    integrationType: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    isActive: PropTypes.bool,
  };

  static defaultProps = {
    onClick: () => {},
    isActive: false,
  };

  itemClickHandler = () =>
    this.props.onClick({
      integrationType: this.props.integrationType,
    });

  render() {
    const { integrationType, isActive } = this.props;

    return (
      <div
        className={cx('integrations-list-item', { active: isActive })}
        onClick={this.itemClickHandler}
      >
        <img
          className={cx('integration-image')}
          src={INTEGRATIONS_IMAGES_MAP[integrationType.name]}
          alt={integrationType.name}
        />
        <div className={cx('integration-info-block')}>
          <span className={cx('integration-name')}>{integrationType.name}</span>
          <span className={cx('plugin-author')}>{`by ${integrationType.uploadedBy}`}</span>
        </div>
      </div>
    );
  }
}

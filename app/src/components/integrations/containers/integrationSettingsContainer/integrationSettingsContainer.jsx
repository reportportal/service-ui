import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { updateProjectIntegrationAction } from 'controllers/project';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP, INTEGRATIONS_IMAGES_MAP } from '../../constants';
import styles from './integrationSettingsContainer.scss';

const cx = classNames.bind(styles);

@connect(null, {
  updateProjectIntegrationAction,
})
export class IntegrationSettingsContainer extends Component {
  static propTypes = {
    goToPreviousPage: PropTypes.func.isRequired,
    updateProjectIntegrationAction: PropTypes.func.isRequired,
    data: PropTypes.object,
    title: PropTypes.string,
  };

  static defaultProps = {
    data: {},
    title: '',
  };

  state = {
    updatedParameters: {},
  };

  updateIntegration = (formData, onConfirm) => {
    const {
      data: { id, integrationType },
    } = this.props;

    const data = {
      enabled: true,
      integrationName: integrationType.name,
      integrationParameters: formData,
    };

    this.props.updateProjectIntegrationAction(data, id, () => {
      onConfirm();
      this.setState({
        updatedParameters: formData,
      });
    });
  };

  render() {
    const { data, title, goToPreviousPage } = this.props;
    const integrationName = data.integrationType.name;
    const image = INTEGRATIONS_IMAGES_MAP[integrationName];
    const IntegrationSettingsComponent = INTEGRATIONS_SETTINGS_COMPONENTS_MAP[integrationName];
    const updatedData = {
      ...data,
      integrationParameters: {
        ...data.integrationParameters,
        ...this.state.updatedParameters,
      },
    };

    return (
      <div className={cx('integration-settings-container')}>
        <div className={cx('settings-header')}>
          <img className={cx('logo')} src={image} alt={title} />
          <h2 className={cx('title')}>{title}</h2>
        </div>
        <IntegrationSettingsComponent
          data={updatedData}
          onUpdate={this.updateIntegration}
          goToPreviousPage={goToPreviousPage}
        />
      </div>
    );
  }
}

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { namedIntegrationsSelectorsMap } from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import { INTEGRATIONS_COMPONENTS_MAP } from 'components/integrations/constants';
import styles from './integrationModalContent.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  resetIntegrations: {
    id: 'IntegrationModalContent.resetIntegrations',
    defaultMessage: 'Return to global settings',
  },
});

@connect(
  (state, ownProps) => ({
    integrations: namedIntegrationsSelectorsMap[ownProps.integrationType.name](state),
  }),
  {
    showModalAction,
  },
)
@injectIntl
export class IntegrationModalContent extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    closeModal: PropTypes.func.isRequired,
    integrations: PropTypes.array.isRequired,
    integrationType: PropTypes.object.isRequired,
    showModalAction: PropTypes.func.isRequired,
  };

  showResetIntegrationsModal = () =>
    this.props.showModalAction({
      id: 'resetIntegrationsModal',
      data: { integrationName: this.props.integrationType.name },
    });

  render() {
    const { intl, integrationType } = this.props;

    const IntegrationComponent = INTEGRATIONS_COMPONENTS_MAP[integrationType.name];

    return (
      <Fragment>
        <div className={cx('integration-modal-content')}>
          <IntegrationComponent instances={this.props.integrations} onConfirm={this.closeModal} />
        </div>
        <div className={cx('reset-integrations-block')}>
          <div
            className={cx('reset-integrations-button')}
            onClick={this.showResetIntegrationsModal}
          >
            {intl.formatMessage(messages.resetIntegrations)}
          </div>
        </div>
      </Fragment>
    );
  }
}

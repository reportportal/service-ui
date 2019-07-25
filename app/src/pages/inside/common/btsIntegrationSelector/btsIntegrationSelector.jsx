import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FormField } from 'components/fields/formField';
import { INTEGRATION_NAMES_TITLES } from 'components/integrations';
import styles from './btsIntegrationSelector.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  btsTitle: {
    id: 'BtsIntegrationSelector.btsTitle',
    defaultMessage: 'BTS',
  },
  integrationNameTitle: {
    id: 'BtsIntegrationSelector.integrationNameTitle',
    defaultMessage: 'Integration name',
  },
});

@injectIntl
export class BtsIntegrationSelector extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    namedBtsIntegrations: PropTypes.object.isRequired,
    pluginName: PropTypes.string.isRequired,
    integrationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    onChangePluginName: PropTypes.func.isRequired,
    onChangeIntegration: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.pluginNamesOptions = Object.keys(props.namedBtsIntegrations).map((key) => ({
      value: key,
      label: INTEGRATION_NAMES_TITLES[key],
    }));
  }

  getIntegrationNamesOptions = () =>
    this.props.namedBtsIntegrations[this.props.pluginName].map((item) => ({
      value: item.id,
      label: item.name,
    }));

  isMultipleBtsPlugins = () => Object.keys(this.props.namedBtsIntegrations).length > 1;

  isMultipleBtsIntegrations = () =>
    this.props.namedBtsIntegrations[this.props.pluginName].length > 1;

  render() {
    const { intl, pluginName, onChangePluginName, integrationId, onChangeIntegration } = this.props;

    return (
      <Fragment>
        <FormField
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.btsTitle)}
          labelClassName={cx('label')}
          withoutProvider
        >
          <InputDropdown
            value={pluginName}
            options={this.pluginNamesOptions}
            onChange={onChangePluginName}
            disabled={!this.isMultipleBtsPlugins()}
          />
        </FormField>
        <FormField
          fieldWrapperClassName={cx('field-wrapper')}
          label={intl.formatMessage(messages.integrationNameTitle)}
          labelClassName={cx('label')}
          withoutProvider
        >
          <InputDropdown
            value={integrationId}
            options={this.getIntegrationNamesOptions()}
            onChange={onChangeIntegration}
            disabled={!this.isMultipleBtsIntegrations()}
          />
        </FormField>
      </Fragment>
    );
  }
}

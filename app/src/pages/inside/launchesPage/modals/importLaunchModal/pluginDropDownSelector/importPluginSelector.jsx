import React from 'react';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { InputDropdown } from 'components/inputs/inputDropdown';
import styles from './importPluginSelector.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  reportType: {
    id: 'ImportPluginSelector.ReportType',
    defaultMessage: 'Report type:',
  },
});

export const ImportPluginSelector = ({ selectedPluginData, importPlugins, selectPlugin }) => {
  const { formatMessage } = useIntl();

  const pluginNamesOptions = importPlugins.map((plugin) => ({
    label: plugin.name,
    value: plugin.name,
  }));

  return (
    <div className={cx('import-plugin-selector')}>
      <span className={cx('field-name')}>{formatMessage(messages.reportType)}</span>
      <div className={cx('dropdown-wrapper')}>
        <InputDropdown
          value={selectedPluginData.name}
          options={pluginNamesOptions}
          onChange={selectPlugin}
        />
      </div>
    </div>
  );
};
ImportPluginSelector.propTypes = {
  selectedPluginData: PropTypes.object.isRequired,
  importPlugins: PropTypes.array.isRequired,
  selectPlugin: PropTypes.func.isRequired,
};

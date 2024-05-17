import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Dropdown } from 'componentLibrary/dropdown';
import styles from './importPluginSelector.scss';

const cx = classNames.bind(styles);
const DEFAULT_PLUGIN_NAME = 'JUnit';

const messages = defineMessages({
  reportType: {
    id: 'ImportPluginSelector.ReportType',
    defaultMessage: 'Report type:',
  },
});

export const ImportPluginSelector = ({ setSelectedPluginData, importPlugins }) => {
  const { formatMessage } = useIntl();

  const [selectedPluginName, setSelectedPluginName] = useState(DEFAULT_PLUGIN_NAME);

  const selectPlugin = (name) => {
    setSelectedPluginName(name);
    setSelectedPluginData(importPlugins.find((plugin) => plugin.name === name));
  };

  useEffect(() => {
    if (importPlugins.some((plugin) => plugin.name === DEFAULT_PLUGIN_NAME)) {
      selectPlugin(DEFAULT_PLUGIN_NAME);
    } else {
      selectPlugin(importPlugins?.[0]?.name);
    }
  }, []);

  const pluginNamesOptions = importPlugins.map((plugin) => ({
    label: plugin.name,
    value: plugin.name,
  }));

  const onChangePluginName = (pluginName) => {
    if (pluginName !== selectedPluginName) {
      setSelectedPluginName(pluginName);
      setSelectedPluginData(importPlugins.find((plugin) => plugin.name === pluginName));
    }
  };

  const dropdownValue = {
    label: selectedPluginName,
    value: selectedPluginName,
  };

  return (
    <div className={cx('import-plugin-selector')}>
      <span className={cx('field-name')}>{formatMessage(messages.reportType)}</span>
      <Dropdown value={dropdownValue} options={pluginNamesOptions} onChange={onChangePluginName} />
    </div>
  );
};
ImportPluginSelector.propTypes = {
  setSelectedPluginData: PropTypes.func.isRequired,
  importPlugins: PropTypes.array.isRequired,
};

import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Dropdown } from 'componentLibrary/dropdown';
import styles from './pluginDropDown.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  reportType: {
    id: 'PluginDropDown.ReportType',
    defaultMessage: 'Report type:',
  },
});

export const PluginDropDown = ({ setSelectedPluginData, importPlugins }) => {
  const { formatMessage } = useIntl();

  const [selectedPlugin, setSelectedPlugin] = useState({
    label: importPlugins?.[0]?.name,
    value: importPlugins?.[0]?.name,
  });

  const pluginNamesOptions = importPlugins.map((plugin) => ({
    label: plugin.name,
    value: plugin.name,
  }));

  const onChangePluginName = (pluginName) => {
    if (pluginName !== selectedPlugin.name) {
      setSelectedPlugin({
        label: pluginName,
        value: pluginName,
      });
      setSelectedPluginData(importPlugins.filter((p) => p.name !== pluginName)?.[0]);
    }
  };

  return (
    <div className={cx('plugin-dropdown')}>
      <span className={cx('field-name')}>{formatMessage(messages.reportType)}</span>
      <Dropdown value={selectedPlugin} options={pluginNamesOptions} onChange={onChangePluginName} />
    </div>
  );
};
PluginDropDown.propTypes = {
  setSelectedPluginData: PropTypes.func.isRequired,
  importPlugins: PropTypes.array.isRequired,
};

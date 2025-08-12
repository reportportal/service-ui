import React from 'react';
import { useSelector } from 'react-redux';
import { pluginPageSelector } from 'controllers/pages';

export const useActivePluginPageExtension = (extensionsSelector) => {
  const extensions = useSelector(extensionsSelector);
  const activePluginPage = useSelector(pluginPageSelector);

  const extension = React.useMemo(
    () =>
      extensions.find(
        (ext) => activePluginPage === ext.payload.slug || activePluginPage === ext.payload.name,
      ),
    [extensions, activePluginPage],
  );

  return extension;
};

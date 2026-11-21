/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { PLUGIN_DEFAULT_IMAGE, PLUGIN_ICON_TYPES } from 'components/integrations/constants';
import { remoteExtensionIconType } from 'components/extensionLoader/extensionTypes';
import { Image } from 'components/main/image';

// Plugin SVG is rendered in an image context, where scripts, external references and styles are
// inert, instead of being parsed into the page.
export const svgToDataUrl = (svg = '') => {
  const source = /<svg\b[^>]*\sxmlns=/i.test(svg)
    ? svg
    : svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
};

export const RemotePluginIcon = ({
  icon = {},
  fallback = PLUGIN_DEFAULT_IMAGE,
  className = '',
  ...rest
}) => {
  const { type, content } = icon;

  const isSvg = type === PLUGIN_ICON_TYPES.SVG;

  return (
    <Image
      src={isSvg ? svgToDataUrl(content) : content}
      fallback={fallback}
      isStatic={type !== PLUGIN_ICON_TYPES.URL}
      preloaderColor="charcoal"
      className={className}
      {...rest}
    />
  );
};
RemotePluginIcon.propTypes = {
  icon: remoteExtensionIconType,
  fallback: PropTypes.string,
  className: PropTypes.string,
};

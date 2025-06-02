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
import Parser from 'html-react-parser';
import { PLUGIN_DEFAULT_IMAGE, PLUGIN_ICON_TYPES } from 'components/integrations/constants';
import { Image } from 'components/main/image';

export const RemotePluginIcon = ({ icon = {}, className = '', ...rest }) => {
  const { type, content } = icon;

  return type === PLUGIN_ICON_TYPES.SVG ? (
    Parser(content)
  ) : (
    <Image
      src={content}
      fallback={PLUGIN_DEFAULT_IMAGE}
      isStatic={type !== PLUGIN_ICON_TYPES.URL}
      preloaderColor="charcoal"
      className={className}
      {...rest}
    />
  );
};
RemotePluginIcon.propTypes = {
  icon: PropTypes.shape({
    type: PropTypes.oneOf([
      PLUGIN_ICON_TYPES.SVG,
      PLUGIN_ICON_TYPES.BASE_64,
      PLUGIN_ICON_TYPES.URL,
    ]),
    content: PropTypes.string,
  }),
  className: PropTypes.string,
};

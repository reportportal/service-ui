/*
 * Copyright 2024 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { userInfoSelector } from 'controllers/user';
import { projectInfoSelector } from 'controllers/project';
import { extensionType } from '../extensionTypes';

// TODO: add loader while loading the iframe
// TODO: configure sandbox for iframe
function StandaloneExtensionLoader({ extension, userInfo, projectInfo }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();

  const onLoad = () => {
    setLoaded(true);
  };

  const sendRpContext = () => {
    const consumerOrigin = new URL(extension.url).origin;
    const data = {
      user: userInfo,
      project: projectInfo,
    };
    ref?.current?.contentWindow.postMessage(data, consumerOrigin);
  };

  useEffect(() => {
    if (loaded) {
      sendRpContext();
    }
  }, [loaded, userInfo, projectInfo]);

  return (
    <iframe
      ref={ref}
      name={extension.pluginName}
      title={extension.pluginName}
      src={extension.url}
      style={{ width: '100%', height: '100%' }}
      onLoad={onLoad}
      seamless
    />
  );
}
StandaloneExtensionLoader.propTypes = {
  extension: extensionType,
  userInfo: PropTypes.object.isRequired,
  projectInfo: PropTypes.object.isRequired,
};
StandaloneExtensionLoader.defaultProps = {
  extension: {},
};

const withConnect = connect((state) => ({
  userInfo: userInfoSelector(state),
  projectInfo: projectInfoSelector(state),
}));

const ConnectedStandaloneExtensionLoader = withConnect(StandaloneExtensionLoader);

export { ConnectedStandaloneExtensionLoader as StandaloneExtensionLoader };

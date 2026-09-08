/*
 * Copyright 2026 EPAM Systems
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

import { createClassnames } from 'common/utils';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import type { ReactNode } from 'react';
import { useTracking } from 'react-tracking';
import styles from './mcpBlock.scss';

const cx = createClassnames(styles);

type McpConfigProps = {
  children: ReactNode;
  description?: string;
};

const NOTE =
  'NOTE: <API_KEY> should be replaced with corresponding apiKey from API KEYS tab. <projectKey> should be replaced with the corresponding project key which you can find on Project settings > General tab.';

const McpConfig = ({ children, description }: McpConfigProps) => {
  const { trackEvent } = useTracking();

  return (
    <div className={cx('content-wrapper')}>
    <h1 className={cx('h1')}>COPY AND SAVE IT TO YOUR MCP CLIENT CONFIG (mcp.json)</h1>
    <p className={cx('paragraph')}>
      Paste the reportportal block into your client config.
      <br />
      Cursor / Claude Desktop: wrap in mcpServers. VS Code / JetBrains Copilot: wrap in servers.
    </p>
    {description && <p className={cx('paragraph')}>{description}</p>}
    <p className={cx('paragraph')}>
      Choose the appropriate{' '}
      <a
        className={cx('link')}
        href="https://github.com/reportportal/reportportal-mcp-server"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent(PROFILE_PAGE_EVENTS.CLICK_MCP_DOCUMENTATION_LINK)}
      >
        MCP documentation
      </a>
      {' '}from the list and follow the configuration guide
    </p>
    <p>{`{`}</p>
    <div className={cx('options')}>
      <p>{`"reportportal": {`}</p>
      {children}
      <p>{`}`}</p>
    </div>
    <p>{`}`}</p>
      <div className={cx('note')}>{NOTE}</div>
    </div>
  );
};

const localConfig = () => ({
  name: 'Local',
  eventInfo: {
    changeTab: PROFILE_PAGE_EVENTS.clickProfilePageMcpSubTab('local'),
  },
  content: (
    <McpConfig>
      <div className={cx('options')}>
        <p>{`"command": "docker",`}</p>
        <p>{`"args": [`}</p>
        <div className={cx('options')}>
          <p>{`"run",`}</p>
          <p>{`"-i",`}</p>
          <p>{`"--rm",`}</p>
          <p>{`"-e",`}</p>
          <p>{`"RP_API_TOKEN",`}</p>
          <p>{`"-e",`}</p>
          <p>{`"RP_HOST",`}</p>
          <p>{`"-e",`}</p>
          <p>{`"RP_PROJECT",`}</p>
          <p>{`"reportportal/mcp-server"`}</p>
        </div>
        <p>{`],`}</p>
        <p>{`"env": {`}</p>
        <div className={cx('options')}>
          <p>{`"RP_API_TOKEN": "<API_KEY>",`}</p>
          <p>{`"RP_HOST": "${window.location.origin}",`}</p>
          <p>{`"RP_PROJECT": "<projectKey>"`}</p>
        </div>
        <p>{`}`}</p>
      </div>
    </McpConfig>
  ),
});

const remoteConfig = () => ({
  name: 'Remote',
  eventInfo: {
    changeTab: PROFILE_PAGE_EVENTS.clickProfilePageMcpSubTab('remote'),
  },
  content: (
    <McpConfig
      description="The remote server must be deployed and running in HTTP mode (MCP_MODE=http)."
    >
      <div className={cx('options')}>
        <p>{`"url": "<MCP_SERVER_URL>/mcp/",`}</p>
        <p>{`"headers": {`}</p>
        <div className={cx('options')}>
          <p>{`"Authorization": "Bearer <API_KEY>",`}</p>
          <p>{`"X-Project": "<projectKey>"`}</p>
        </div>
        <p>{`}`}</p>
      </div>
    </McpConfig>
  ),
});

export const TabsConfig = {
  localConfig,
  remoteConfig,
};

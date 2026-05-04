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

import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { useTracking } from 'react-tracking';
import { Breadcrumbs } from '@reportportal/ui-kit';
import { PLUGIN_DESCRIPTIONS_MAP } from 'components/integrations/messages';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import NavLink from 'components/main/navLink';
import { createClassnames, createExternalLink } from 'common/utils';
import { FormattedDescription } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { messages } from 'pages/inside/common/integrations/messages';
import styles from './integrationHeader.scss';

const cx = createClassnames(styles);

export interface IntegrationHeaderPluginDetails {
  id?: string;
  name?: string;
  version?: string;
  resources?: string;
  description?: string;
  documentation?: string;
  documentationLink?: string;
}

export interface IntegrationHeaderPluginData {
  name: string;
  creationDate?: number;
  enabled?: boolean;
  groupType?: string;
  type?: number;
  details?: IntegrationHeaderPluginDetails;
}

export interface IntegrationHeaderBreadcrumb {
  id?: string;
  title: string;
  link?: Record<string, unknown>;
  onClick?: () => void;
}

export interface IntegrationHeaderProps {
  data: IntegrationHeaderPluginData;
  documentationLinkEvent: Record<string, unknown>;
  breadcrumbs?: IntegrationHeaderBreadcrumb[];
}

export const IntegrationHeader = ({
  data,
  documentationLinkEvent,
  breadcrumbs = [],
}: IntegrationHeaderProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const { name, details: detailsProp } = data;
  const details = detailsProp ?? { name };
  const displayName = details.name || name;
  const documentationLink = details.documentation || details.documentationLink || '';

  const handleDocumentationClick = () => {
    if (documentationLinkEvent) {
      trackEvent(documentationLinkEvent);
    }
  };

  const integrationDescription: ReactNode = PLUGIN_DESCRIPTIONS_MAP[name] ? (
    <>
      {PLUGIN_DESCRIPTIONS_MAP[name]}{' '}
      <FormattedDescription
        content={formatMessage(messages.linkToDocumentation, {
          a: (link: unknown) => createExternalLink(link, documentationLink, 'documentationLink'),
        })}
        event={documentationLinkEvent}
      />
    </>
  ) : (
    <>
      {details.description && Parser(details.description)} Link to{' '}
      <a
        onClick={handleDocumentationClick}
        target="_blank"
        rel="noreferrer noopener"
        href={documentationLink}
        data-automation-id="documentationLink"
      >
        Documentation
      </a>
    </>
  );

  return (
    <div className={cx('container')}>
      <div className={cx('back-to')}>
        <Breadcrumbs descriptors={breadcrumbs} LinkComponent={NavLink} />
      </div>
      <div className={cx('header')}>
        <div className={cx('integration-block')}>
          <PluginIcon className={cx('integration-image')} pluginData={data} alt={name} />
          <div className={cx('integration-info-block')}>
            <div className={cx('integration-data-block')}>
              <span className={cx('integration-name')}>{displayName}</span>
              <span className={cx('integration-version')}>
                {details.version && `${formatMessage(messages.version)} ${details.version}`}
              </span>
            </div>
            <p className={cx('integration-description')}>{integrationDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

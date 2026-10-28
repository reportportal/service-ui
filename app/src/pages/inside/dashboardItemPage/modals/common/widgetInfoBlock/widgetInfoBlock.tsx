/*
 * Copyright 2019 EPAM Systems
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

import React, { useState, useEffect, useMemo, useRef } from 'react';
import isEqual from 'fast-deep-equal';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { activeDashboardIdSelector } from 'controllers/pages';
import { fetch, debounce, createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LinkComponent } from 'pages/inside/common/LinkComponent';
import { OVERALL_STATISTICS } from 'common/constants/widgetTypes';
import { normalizeSeparateInterrupted } from 'components/main/analytics/events/common/widgetPages/utils';
import { WIDGETS_STATIC_PREVIEWS } from '../widgets';
import { WidgetPreview } from '../widgetPreview';
import styles from './widgetInfoBlock.scss';
import { FieldLabel } from '@reportportal/ui-kit';
import { Widget, ContentParameters } from '../../widgetWizardModal/types';

const cx = createClassnames(styles);

interface WidgetSettings {
  filterIds?: string[];
  contentParameters?: ContentParameters;
}

interface ActiveWidget extends Widget {
  description?: string;
  documentationLink?: string;
  documentationClickEventInfo?: (id: string | number, dashboardId: string) => object;
  preview?: React.ReactNode;
}

interface WidgetInfoBlockProps {
  projectKey: string;
  widgetSettings?: WidgetSettings;
  activeWidget?: ActiveWidget;
  customCondition?: boolean;
}

export const WidgetInfoBlock = ({
  projectKey,
  widgetSettings = {},
  activeWidget = null,
  customCondition = true,
}: WidgetInfoBlockProps) => {
  const { formatMessage } = useIntl();
  const dashboardId = useSelector(activeDashboardIdSelector) as string;

  const [loading, setLoading] = useState(false);
  const [widgetData, setWidgetData] = useState<object | null>(null);

  // Debounced fetch, recreated only when projectKey changes; no refs read inside the callback
  const fetchWidget = useMemo(
    () =>
      debounce((ws: WidgetSettings) => {
        setLoading(true);
        setWidgetData(null);
        fetch(URLS.widgetPreview(projectKey), {
          method: 'post',
          data: ws,
        })
          .then((widget: object) => {
            setLoading(false);
            setWidgetData({ content: widget, ...ws });
          })
          .catch(() => {
            setLoading(false);
            setWidgetData(null);
          });
      }, 300),
    [projectKey],
  );

  const isMountedRef = useRef(false);
  const prevRef = useRef<{ activeWidgetId: string | number | undefined; widgetSettings: WidgetSettings }>({
    activeWidgetId: activeWidget?.id,
    widgetSettings,
  });

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevRef.current = { activeWidgetId: activeWidget?.id, widgetSettings };
      return;
    }

    const prev = prevRef.current;
    prevRef.current = { activeWidgetId: activeWidget?.id, widgetSettings };

    const { filterIds = [], contentParameters = {} } = widgetSettings;

    if (prev.activeWidgetId !== activeWidget?.id) {
      setWidgetData(null);
      return;
    }

    const prevSettings = prev.widgetSettings;
    const prevSeparateInterrupted = normalizeSeparateInterrupted(
      prevSettings?.contentParameters?.widgetOptions?.separateInterrupted,
    );
    const nextSeparateInterrupted = normalizeSeparateInterrupted(
      contentParameters?.widgetOptions?.separateInterrupted,
    );
    const isPanelView = contentParameters?.widgetOptions?.viewMode === 'panel';
    if (isPanelView && prevSeparateInterrupted !== nextSeparateInterrupted) {
      setWidgetData(null);
      setLoading(true);
    }

    const prevData = {
      filterIds: prevSettings?.filterIds,
      contentParameters: prevSettings?.contentParameters,
    };
    const newData = { filterIds, contentParameters };

    if (
      customCondition &&
      !isEqual(prevData, newData) &&
      (filterIds.length || contentParameters?.widgetOptions?.launchNameFilter) &&
      !WIDGETS_STATIC_PREVIEWS[activeWidget?.id ?? '']
    ) {
      fetchWidget(widgetSettings);
    }
  }, [activeWidget?.id, widgetSettings, customCondition, fetchWidget]);

  const widgetOptions = widgetSettings.contentParameters?.widgetOptions;
  const isSeparateInterrupted =
    activeWidget?.id === OVERALL_STATISTICS &&
    widgetOptions?.viewMode === 'panel' &&
    normalizeSeparateInterrupted(widgetOptions?.separateInterrupted);
  const isExpanded = !!isSeparateInterrupted && (loading || !!widgetData);

  return (
    activeWidget?.id && (
      <div className={cx('edit-widget-info-section')}>
        <div className={cx('widget-info-block')}>
          <FieldLabel className={cx('widget-title')}>{activeWidget?.title}</FieldLabel>
          <div className={cx('widget-description')}>{activeWidget?.description}</div>
          {activeWidget?.documentationLink && (
            <LinkComponent
              to={activeWidget?.documentationLink}
              event={activeWidget?.documentationClickEventInfo?.(activeWidget?.id, dashboardId)}
            >
              {formatMessage(COMMON_LOCALE_KEYS.learnMore)}
            </LinkComponent>
          )}
        </div>
        <WidgetPreview
          defaultPreview={activeWidget?.preview}
          loading={loading}
          widgetType={activeWidget?.id}
          data={widgetData}
          className={cx({ expanded: isExpanded })}
        />
      </div>
    )
  );
};

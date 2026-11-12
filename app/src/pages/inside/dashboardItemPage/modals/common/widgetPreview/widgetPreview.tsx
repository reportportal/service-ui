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

import { ReactNode, useState, ComponentType } from 'react';
import { BubblesLoader } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { CHARTS } from 'components/widgets';
import { messages as noDataMessages } from 'components/widgets/noDataAvailable';
import { createClassnames } from 'common/utils';
import { WIDGETS_STATIC_PREVIEWS } from '../widgets';
import { isWidgetDataAvailable } from '../utils';
import styles from './widgetPreview.scss';

const cx = createClassnames(styles);

interface WidgetPreviewData {
  widgetType?: string | number;
  content?: object;
}

interface PreviewChartProps {
  isPreview: boolean;
  widget: WidgetPreviewData;
  isFullscreen: boolean;
  container: Element;
}

interface WidgetPreviewProps {
  widgetType?: string | number;
  data?: WidgetPreviewData | null;
  loading?: boolean;
  defaultPreview?: ReactNode;
  className?: string;
}

interface PreviewFrameProps {
  children: ReactNode;
  className?: string;
  dynamic?: boolean;
  centered?: boolean;
  containerRef?: (node: HTMLDivElement | null) => void;
}

const charts = CHARTS as unknown as Record<string, ComponentType<PreviewChartProps> | undefined>;

const PreviewFrame = ({
  children,
  className,
  dynamic = false,
  centered = false,
  containerRef,
}: PreviewFrameProps) => (
  <div className={cx('widget-preview', className)}>
    <div className={cx(dynamic ? 'dynamic-preview' : 'static-preview')}>
      <div ref={containerRef} className={cx('preview-frame')}>
        {centered ? <div className={cx('centered')}>{children}</div> : children}
      </div>
    </div>
  </div>
);

export const WidgetPreview = ({
  widgetType = '',
  data = null,
  loading = false,
  defaultPreview = null,
  className,
}: WidgetPreviewProps) => {
  const { formatMessage } = useIntl();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const Chart = charts[widgetType];
  const staticPreview = WIDGETS_STATIC_PREVIEWS[widgetType] as ReactNode;

  if (staticPreview) {
    return <PreviewFrame className={className}>{staticPreview}</PreviewFrame>;
  }

  if (loading) {
    return (
      <PreviewFrame dynamic centered className={className} containerRef={setContainer}>
        <BubblesLoader variant="large" />
      </PreviewFrame>
    );
  }

  if (data && !isWidgetDataAvailable(data)) {
    return (
      <PreviewFrame dynamic centered className={className} containerRef={setContainer}>
        {formatMessage(noDataMessages.noDataAvailable)}
      </PreviewFrame>
    );
  }

  if (!data || !Chart) {
    return <PreviewFrame className={className}>{defaultPreview}</PreviewFrame>;
  }

  return (
    <PreviewFrame dynamic className={className} containerRef={setContainer}>
      {data.widgetType === widgetType && container && (
        <Chart isPreview widget={data} isFullscreen={false} container={container} />
      )}
    </PreviewFrame>
  );
};

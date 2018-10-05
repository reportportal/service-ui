import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import StackTraceIcon from 'common/img/stack-trace-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import TestParamsIcon from 'common/img/test-params-icon-inline.svg';
import ClockIcon from 'common/img/clock-inline.svg';
import { InfoTabs } from '../infoTabs';
import { Parameters } from './parameters';
import { LogItemDetails } from './logItemDetails';

const messages = defineMessages({
  stackTab: {
    id: 'LogItemInfoTabs.stackTab',
    defaultMessage: 'Stack trace',
  },
  attachmentsTab: {
    id: 'LogItemInfoTabs.attachmentsTab',
    defaultMessage: 'Attachments',
  },
  detailsTab: {
    id: 'LogItemInfoTabs.detailsTab',
    defaultMessage: 'Item details',
  },
  parametersTab: {
    id: 'LogItemInfoTabs.parametersTab',
    defaultMessage: 'Parameters',
  },
  historyTab: {
    id: 'LogItemInfoTabs.historyTab',
    defaultMessage: 'History of actions',
  },
});

const makeTabs = ({ formatMessage }, logItem) => [
  {
    id: 'stack',
    label: formatMessage(messages.stackTab),
    icon: StackTraceIcon,
    content: <div>Stack trace</div>,
  },
  {
    id: 'attachments',
    label: formatMessage(messages.attachmentsTab),
    icon: AttachmentIcon,
    content: <div>Attachments</div>,
  },
  {
    id: 'details',
    label: formatMessage(messages.detailsTab),
    icon: InfoIcon,
    content: <LogItemDetails logItem={logItem} />,
  },
  {
    id: 'parameters',
    label: formatMessage(messages.parametersTab),
    icon: TestParamsIcon,
    content: <Parameters logItem={logItem} />,
  },
  {
    id: 'history',
    label: formatMessage(messages.historyTab),
    icon: ClockIcon,
    content: <div>History of actions</div>,
  },
];

export const LogItemInfoTabs = injectIntl(({ intl, logItem }) => (
  <InfoTabs tabs={makeTabs(intl, logItem)} />
));

LogItemInfoTabs.propTypes = {
  logItem: PropTypes.object.isRequired,
};

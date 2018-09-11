import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import StackTraceIcon from 'common/img/stack-trace-inline.svg';
import AttachmentIcon from 'common/img/attachment-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import TestParamsIcon from 'common/img/test-params-icon-inline.svg';
import ClockIcon from 'common/img/clock-inline.svg';
import { InfoTabs } from '../InfoTabs/InfoTabs';

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

const makeTabs = ({ formatMessage }) => [
  {
    id: 'stack',
    label: formatMessage(messages.stackTab),
    getIcon: () => Parser(StackTraceIcon),
    getContent: () => <div>Stack trace</div>,
  },
  {
    id: 'attachments',
    label: formatMessage(messages.attachmentsTab),
    getIcon: () => Parser(AttachmentIcon),
    getContent: () => <div>Attachments</div>,
  },
  {
    id: 'details',
    label: formatMessage(messages.detailsTab),
    getIcon: () => Parser(InfoIcon),
    getContent: () => <div>Item details</div>,
  },
  {
    id: 'parameters',
    label: formatMessage(messages.parametersTab),
    getIcon: () => Parser(TestParamsIcon),
    getContent: () => <div>Parameters</div>,
  },
  {
    id: 'history',
    label: formatMessage(messages.historyTab),
    getIcon: () => Parser(ClockIcon),
    getContent: () => <div>History of actions</div>,
  },
];

export const LogItemInfoTabs = injectIntl(({ intl }) => <InfoTabs tabs={makeTabs(intl)} />);

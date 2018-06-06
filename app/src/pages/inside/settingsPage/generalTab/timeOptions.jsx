import React from 'react';
import { FormattedMessage } from 'react-intl';

const timeTimeoutOptions = [
  {
    value: '1H',
    label: <FormattedMessage id={'GeneralTab.time1H'} defaultMessage={'1 hour'} />,
    disabled: false,
  },
  {
    value: '3H',
    label: <FormattedMessage id={'GeneralTab.time3H'} defaultMessage={'3 hours'} />,
    disabled: false,
  },
  {
    value: '6H',
    label: <FormattedMessage id={'GeneralTab.time6H'} defaultMessage={'6 hours'} />,
    disabled: false,
  },
  {
    value: '12H',
    label: <FormattedMessage id={'GeneralTab.time12H'} defaultMessage={'12 hours'} />,
    disabled: false,
  },
  {
    value: '1D',
    label: <FormattedMessage id={'GeneralTab.time1D'} defaultMessage={'1 Day'} />,
    disabled: false,
  },
  {
    value: '1W',
    label: <FormattedMessage id={'GeneralTab.time1W'} defaultMessage={'1 week'} />,
    disabled: false,
  },
];

const timeStorageOptions = [
  {
    value: '2W',
    label: <FormattedMessage id={'GeneralTab.time2W'} defaultMessage={'2 weeks'} />,
    disabled: false,
  },
  {
    value: '1M',
    label: <FormattedMessage id={'GeneralTab.time1M'} defaultMessage={'1 month'} />,
    disabled: false,
  },
  {
    value: '3M',
    label: <FormattedMessage id={'GeneralTab.time3M'} defaultMessage={'3 months'} />,
    disabled: false,
  },
  {
    value: '6M',
    label: <FormattedMessage id={'GeneralTab.time6M'} defaultMessage={'6 months'} />,
    disabled: false,
  },
  {
    value: 'F',
    label: <FormattedMessage id={'GeneralTab.timeForever'} defaultMessage={'Forever'} />,
    disabled: false,
  },
];

export { timeStorageOptions, timeTimeoutOptions };

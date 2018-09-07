import { getTimestampFromMinutes } from 'common/utils';

export const parseDateTimeRange = (value) => {
  const dateString = value.value;
  if (dateString.indexOf(',') !== -1) {
    const splitted = dateString.split(',');
    return {
      start: parseInt(splitted[0], 10),
      end: parseInt(splitted[1], 10),
      dynamic: false,
    };
  }
  if (dateString.indexOf(';') !== -1) {
    const splitted = dateString.split(';');
    return {
      start: getTimestampFromMinutes(splitted[0]),
      end: getTimestampFromMinutes(splitted[1]),
      dynamic: true,
    };
  }
  throw new Error('Invalid date string provided');
};

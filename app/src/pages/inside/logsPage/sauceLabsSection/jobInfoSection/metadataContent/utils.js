import moment from 'moment';

export const defaultDataFormatter = (data) => {
  if (data) {
    return data.toString();
  }
  if (data === null) {
    return 'null';
  }
  return '-';
};

export const timeDataFormatter = (data) => moment.unix(data).format('YYYY-MM-DD HH:mm:ss');

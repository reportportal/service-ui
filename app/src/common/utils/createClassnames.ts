import classNames from 'classnames/bind';

export const createClassnames = <T>(styles: T) => classNames.bind(styles) as typeof classNames;

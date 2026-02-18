import classNames from 'classnames/bind';

export const createClassnames = (...styles: Record<string, string>[]) => {
  const mergedStyles = styles.reduce(
    (acc, style) => ({ ...acc, ...style }),
    {} as Record<string, string>,
  );

  return classNames.bind(mergedStyles) as typeof classNames;
};

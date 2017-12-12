import { connect } from '@cerebral/react';

export default function (connectProps, component) {
  // eslint-disable-next-line no-undef
  if (STORYBOOK) {
    return component;
  }
  return connect(connectProps, component);
}

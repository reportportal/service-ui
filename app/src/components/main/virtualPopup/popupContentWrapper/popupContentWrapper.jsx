import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';

export class PopupContentWrapper extends PureComponent {
  static propTypes = {
    scheduleUpdate: PropTypes.func.isRequired,
    referencePosition: PropTypes.object,
    children: PropTypes.element,
  };

  static defaultProps = {
    referencePosition: {},
    children: null,
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.referencePosition, this.props.referencePosition)) {
      this.props.scheduleUpdate();
    }
  }

  render() {
    const { children } = this.props;

    return <div>{children}</div>;
  }
}

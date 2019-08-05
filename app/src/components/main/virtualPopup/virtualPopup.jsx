import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Popper } from 'react-popper';

const DEFAULT_REFERENCE_ELEMENT = {
  getBoundingClientRect() {
    return {
      width: 1,
      height: 1,
    };
  },

  get clientWidth() {
    return this.getBoundingClientRect().width;
  },

  get clientHeight() {
    return this.getBoundingClientRect().height;
  },
};

export class VirtualPopup extends PureComponent {
  static propTypes = {
    referenceElement: PropTypes.object,
    positionConfig: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      bottom: PropTypes.number,
      right: PropTypes.number,
    }),
    children: PropTypes.element,
  };

  static defaultProps = {
    referenceElement: DEFAULT_REFERENCE_ELEMENT,
    positionConfig: {},
    children: null,
  };

  render() {
    const { referenceElement, positionConfig, children } = this.props;

    return ReactDOM.createPortal(
      <Popper referenceElement={referenceElement}>
        {({ ref, style, placement }) => (
          <div ref={ref} style={{ ...style, ...positionConfig }} data-placement={placement}>
            {children}
          </div>
        )}
      </Popper>,
      document.querySelector('#popover-root'),
    );
  }
}

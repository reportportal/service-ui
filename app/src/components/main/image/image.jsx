/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { fetch, ERROR_CANCELED } from 'common/utils/fetch';
import { DottedPreloader } from 'components/preloaders/dottedPreloader';
import { registerImageRequest } from './imageRequestGroups';
import styles from './image.scss';

const cx = classNames.bind(styles);

const LAZY_ROOT_MARGIN = '200px';

export class Image extends Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    isStatic: PropTypes.bool,
    fallback: PropTypes.string,
    preloaderColor: PropTypes.string,
    requestParams: PropTypes.object,
    requestGroup: PropTypes.string,
    lazy: PropTypes.bool,
  };

  static defaultProps = {
    alt: '',
    isStatic: false,
    fallback: null,
    preloaderColor: '',
    requestParams: {},
    requestGroup: '',
    lazy: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      fileURL: null,
      loading: !props.isStatic,
      error: false,
    };
    this.loaderRef = createRef();
    this.observer = null;
    this.isVisible = false;
    this.isRequested = false;
  }

  componentDidMount() {
    if (this.shouldLoadLazily()) {
      this.observeVisibility();
    } else {
      this.fetchImage();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      this.cancelPendingRequest();
      this.isRequested = false;
    }
    if (this.shouldFetch()) {
      this.fetchImage();
    }
  }

  shouldFetch = () =>
    !this.props.isStatic && !this.isRequested && (!this.observer || this.isVisible);

  componentWillUnmount() {
    this.disconnectObserver();
    this.cancelPendingRequest();
    this.revokeURL();
  }

  shouldLoadLazily = () =>
    this.props.lazy && !this.props.isStatic && typeof IntersectionObserver !== 'undefined';

  observeVisibility = () => {
    const node = this.loaderRef.current;

    if (!node) {
      this.fetchImage();
      return;
    }

    this.observer = new IntersectionObserver(this.handleIntersection, {
      rootMargin: LAZY_ROOT_MARGIN,
    });
    this.observer.observe(node);
  };

  disconnectObserver = () => {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  };

  handleIntersection = (entries) => {
    this.isVisible = entries[entries.length - 1].isIntersecting;

    if (this.isVisible) {
      if (!this.isRequested) {
        this.fetchImage();
      }
    } else if (this.isRequested) {
      this.cancelPendingRequest();
      this.isRequested = false;
    }
  };

  cancelPendingRequest = () => {
    if (this.unregisterRequest) {
      this.unregisterRequest();
      this.unregisterRequest = null;
    }
    if (this.cancelRequest) {
      this.cancelRequest();
      this.cancelRequest = null;
    }
  };

  getURL = () => {
    const { src, fallback, isStatic } = this.props;
    const { error, loading, fileURL } = this.state;
    if (loading) {
      return null;
    }
    let url;
    if (isStatic) {
      url = src;
    } else if (error) {
      url = fallback;
    } else {
      url = fileURL;
    }
    return url;
  };

  fetchImage = () => {
    if (!this.props.isStatic) {
      this.cancelPendingRequest();
      this.isRequested = true;

      this.setState({
        loading: true,
      });

      let currentCancel = null;

      fetch(this.props.src, {
        responseType: 'blob',
        ...this.props.requestParams,
        abort: (cancel) => {
          currentCancel = cancel;
          this.cancelRequest = cancel;
          if (this.props.requestGroup) {
            this.unregisterRequest = registerImageRequest(this.props.requestGroup, cancel);
          }
        },
      })
        .then((file) => {
          this.releaseRequest(currentCancel);
          this.createURL(file);
        })
        .catch((error) => {
          if (error?.message === ERROR_CANCELED) {
            if (this.cancelRequest === currentCancel) {
              this.releaseRequest(currentCancel);
              this.isRequested = false;
            }
            return;
          }
          this.releaseRequest(currentCancel);
          this.disconnectObserver();
          this.setState({ error: true, loading: false });
        });
    }
  };

  releaseRequest = (cancel) => {
    if (this.cancelRequest !== cancel) {
      return;
    }
    if (this.unregisterRequest) {
      this.unregisterRequest();
      this.unregisterRequest = null;
    }
    this.cancelRequest = null;
  };

  normalizeFileTypeForSvg = (file) => {
    if (file.type.includes('text/xml')) {
      return new Blob([file], { type: 'image/svg+xml' });
    }

    return file;
  };

  createURL = (file) => {
    this.disconnectObserver();
    const normalizedFile = this.normalizeFileTypeForSvg(file);
    this.setState({ loading: false, fileURL: URL.createObjectURL(normalizedFile), error: false });
  };

  revokeURL = () => {
    if (!this.state.fileURL) {
      return;
    }
    URL.revokeObjectURL(this.state.fileURL);
  };

  render() {
    const {
      src,
      alt,
      fallback,
      isStatic,
      preloaderColor,
      requestParams,
      requestGroup,
      lazy,
      ...rest
    } = this.props;
    const { loading } = this.state;

    return loading && !isStatic ? (
      <div className={cx('loader')} ref={this.loaderRef}>
        <DottedPreloader color={preloaderColor} />
      </div>
    ) : (
      <img src={this.getURL()} onLoad={this.revokeURL} alt={alt} {...rest} />
    );
  }
}

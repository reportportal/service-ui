import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils/fetch';
import ImgLoading from 'common/img/img-loading.gif';
import styles from './image.scss';

const cx = classNames.bind(styles);

export class Image extends Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string,
    isStatic: PropTypes.bool,
    fallback: PropTypes.string,
  };

  static defaultProps = {
    alt: '',
    isStatic: false,
    fallback: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      fileURL: null,
      loading: !props.isStatic,
      error: false,
    };
  }

  componentDidMount() {
    this.fetchImage();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.src !== this.props.src) {
      this.fetchImage();
    }
  }

  componentWillUnmount() {
    this.revokeURL();
  }

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
      this.setState({
        loading: true,
      });

      fetch(this.props.src, { responseType: 'blob' })
        .then(this.createURL)
        .catch(() => {
          this.setState({ error: true, loading: false });
        });
    }
  };

  createURL = (file) =>
    this.setState({ loading: false, fileURL: URL.createObjectURL(file), error: false });

  revokeURL = () => {
    if (!this.state.fileURL) {
      return;
    }
    URL.revokeObjectURL(this.state.fileURL);
  };

  render() {
    const { src, alt, fallback, isStatic, ...rest } = this.props;
    const { loading } = this.state;

    return loading && !isStatic ? (
      <div className={cx('loader')}>
        <img src={ImgLoading} alt={alt} />
      </div>
    ) : (
      <img src={this.getURL()} onLoad={this.revokeURL} alt={alt} {...rest} />
    );
  }
}

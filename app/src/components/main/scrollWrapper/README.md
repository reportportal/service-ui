## **Wrapper for the element which should have scrollbars**

Has no own size. Width and Height = 100% of it's parent.

> Children should be provided

### Props:

- **autoHeight**: _bool_, optional, default = false
- **autoHide**: _bool_, optional, default = false
- **autoHeightMin**: _number_, optional, default = 0
- **autoHeightMax**: _number_, optional, default = 200
- **thumbMinSize**: _number_, optional, default = 30
- **autoHideTimeout**: _number_, optional, default = 500
- **renderTrackHorizontal**: _func_, optional, default = `(props) => <div {...props} className={cx('track-horizontal')} />`
- **renderTrackVertical**: _func_, optional, default = `(props) => <div {...props} className={cx('track-vertical')} />`
- **renderThumbHorizontal**: _func_, optional, default = `(props) => <div {...props} className={cx('thumb-horizontal')} />`
- **renderThumbVertical**: _func_, optional, default = `(props) => <div {...props} className={cx('thumb-vertical')} />`
- **renderView**: _func_, optional, default = `(props) => <div {...props} className={cx('scrolling-content')} />`
- **withBackToTop**: _bool_, optional, default = false
- **hideTracksWhenNotNeeded**: _bool_, optional, default = false
- **children**: _node_, optional, default= {}

If you have provided autoHeigh prop, you also should define autoHeightMax prop to limit content block height.

For more info see https://github.com/malte-wessel/react-custom-scrollbars/blob/master/docs/API.md

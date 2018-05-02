## **Wrapper for the element witch should have scrollbars**

Has no own size. Width and Height = 100% of it's parent.

> Children should be provided

### Props (main):
* **autoHeight**: _bool_, optional, default = false
* **autoHeightMax**: _number_, optional, default = 200
* **thumbMinSize**: _number_, optional, default = 30
* **hideTracksWhenNotNeeded**: _bool_, optional, default = false
* **children**: _node_, optional, default= ""

If you have provided autoHeigh prop, you also should define autoHeightMax prop to limit content block height.

For more info see https://github.com/malte-wessel/react-custom-scrollbars/blob/master/docs/API.md


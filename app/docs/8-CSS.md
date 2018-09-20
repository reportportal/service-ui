# CSS

On our project we are using [SCSS syntax](https://sass-lang.com/guide) and [CSS modules](https://github.com/css-modules/css-modules).

'/src/common/css/common.scss' - common styles.

'/src/common/css/fonts/' - fonts.

'/src/common/css/variables/' - color, font and screen breakpoint variables.

As far as usually components has small size, it's preferable to do not use css selectors nesting (exclude pseudo elements, pseudo classes and state-classes).

It's allowed to use flex-box properties.

It's recommended to define class name the same as component's name, but in lowercase and dash-notation (ComponentName / component-name).

We are strongly recommend to follow next order of CSS properties:

```
.selector {
  /* Positioning */
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;

  /* Display & Box Model */
  display: inline-block;
  overflow: hidden;
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  padding: 10px;
  border: 10px solid $COLOR--black;
  margin: 10px;

  /* Color */
  background: $COLOR--white;
  color: $COLOR--gray;

  /* Text */
  font-family: $FONT-REGULAR;
  font-size: 16px;
  line-height: 1.4;
  text-align: right;

  /* Other */
  cursor: pointer;
}
```

> It's not allowed to:
>
> - define colors directly by hex-codes. All colors used on the project are defined as global variables.
> - use font-weight property. All font types are available with using of global font variables.
> - add new CSS global variables (or edit existing) without discussion with UI Team & UX Designer.

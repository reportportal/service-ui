## **Typical checkbox field with optional text**

Has no own size. Width and Height = 100% of it's parent.

### Align:

- **Vertical** - middle
- **Horizontal** - left(with children), centered(without children)

### Props:

- **children**: _node_, optional, default ""
- **value**: _bool_, optional, default = false
- **disabled**: _bool_, optional, default = false

### Events:

- **onFocus**
- **onBlur**
- **onChange** - returns { value: _bool_ }

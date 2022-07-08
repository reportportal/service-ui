## **System Message**

Default width - 100% of parent element.
Min-height - 104px. Max height - flexible.

### Props:

- **header**: _string_, optional, default = ""
- **caption**: _string_, optional, default = ""
- **children**: _node_, optional, default = null
- **mode**: _string_, optional, default = "info"
- **widthByContent**: _bool_, optional, default = false

### Modes

The System Message comes with mode: _info_ (default), _warning_ and _error_.

### Width by content

By default, width is set to 100% of parent element.
To disable this behavior and set the width of component according to child's width, set the _widthByContent_ prop to true.

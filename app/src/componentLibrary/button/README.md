## **Button**

Min width - 120px. Max width - flexible.

### Props:

- **type**: _string_, optional, default = "button"
- **disabled**: _bool_, optional, default = false
- **variant**: _string_, optional, default = "topaz"
- **wide**: _bool_, optional, default = false
- **startIcon**: _string(imported svg icon)_, optional, default = ""
- **endIcon**: _string(imported svg icon)_, optional, default = ""
- **children**: _node_, optional, default= ""
- **customClassName**: _string_, optional, default= ""
- **dataAutomationId**: _string_, optional, default = ''

### Events:

- **onClick**

### Variants

The Button comes with variants: _topaz_ (default), _ghost_, _danger_ and _text_.  
And similar variants for dark theme: _dark-topaz_, _dark-ghost_ and _dark-text_.

### Icon

Only text variant can be used with icon. You can pass imported svg icon
via _startIcon_ or _endIcon_ props to display it on the left or right respectively.

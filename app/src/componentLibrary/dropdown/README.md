## **Dropdown**

Default width - 240px

### Props:

- **value**: _string_ or _number_ or _object_, optional, default = ""
- **options**: _array_, optional, default = []
- **disabled**: _bool_, optional, default = false
- **error**: _string_, optional, default = ""
- **mobileDisabled**: _bool_, optional, default = false
- **title**: _string_, optional, default = ""
- **touched**: _bool_, optional, default = false
- **icon**: _string(imported svg icon)_, optional, default = ""
- **variant**: _string_, optional, default = "light"
- **placeholder**: _string_, optional, default = ""
- **defaultWidth**: _bool_, optional, default = true

### Events:

- **onChange**
- **onFocus**
- **onBlur**

### Variants

The Dropdown comes with theme variants: _light_ (default), _dark_ and _ghost_

### Icon

Only text variant can be used with icon. You can pass imported svg icon
via _icon_ prop to display it on the left side

### Default width

By default, width is set to 240px.
To disable this behavior set the _defaultWidth_ prop to false

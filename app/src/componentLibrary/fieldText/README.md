## **FieldText**

Has 36px height & width adjusted by content.

### Props:

- **value**: _string_, optional, default = ""
- **className**: _string_, optional, default = ""
- **error**: _string_, optional, default = ""
- **placeholder**: _string_, optional, default = ""
- **maxLength**: _number_, optional, default = 254
- **disabled**: _bool_, optional, default = false
- **refFunction**: func, optional, default = () => {}
- **touched**: _bool_, optional, default = false
- **title**: _string_, optional, default = ""
- **label**: _string_, optional, default = ""
- **helperText**: _string_, optional, default = ""
- **defaultWidth**: _bool_, optional, default = true
- **startIcon**: _string_, optional, default = null
- **endIcon**: _string_, optional, default = null
- **clearable**: _bool_, optional, default = false
- **isRequired**: _bool_, optional, default = false
- **hasDoubleMessage**: _bool_, optional, default = false
- **dataAutomationId**: _string_, optional, default = ''

### Events:

- **onFocus**
- **onBlur**
- **onKeyUp**
- **onKeyDown**
- **onChange** - returns new value: _string_

### Icon

Only text variant can be used with icon. You can pass imported svg icon
via _startIcon_ or _endIcon_ props to display it on the left or right respectively.

### Default width

By default, width is set to 240px.
To disable this behavior set the _defaultWidth_ prop to false
However this props doesn't affect label, error text and helper text
so to restrict whole component to desire width wrap component
to container with desired width

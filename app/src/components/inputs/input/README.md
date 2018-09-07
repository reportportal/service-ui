## **Typical field for text input**

Has 30px height & width adjusted by content.

### Props:

- **type**: _string_, optional, default = "text"
- **value**: _string_, optional, default = ""
- **placeholder**: _string_, optional, default = ""
- **maxLength**: _number_, optional, default = 254
- **disabled**: _bool_, optional, default = false
- **mobileDisabled**: _bool_, optional, default = false
- **readonly**: _bool_, optional, default = false
- **className**: _string_, optional, default = ""
- **error**: _string_, optional, default = ""
- **refFunction**: func, optional, default = () => {}
- **touched**: _bool_, optional, default = false

### Events:

- **onFocus**
- **onBlur**
- **onKeyUp**
- **onKeyPress**
- **onChange** - returns { value: _string_ }

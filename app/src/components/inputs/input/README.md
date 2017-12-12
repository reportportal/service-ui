## **Typical field for text input**

Has no own size. Width and Height = 100% of it's parent.

### Props:
* **type**: _string_, optional, default = "text"
* **defaultValue**: _string_, optional, default = ""
* **placeholder**: _string_, optional, default = ""
* **maxLength**: _number_, optional, default = 256
* **disabled**: _bool_, optional, default = false

### Events:
* **onFocus**
* **onBlur**
* **onChange** - returns { value: _string_ }

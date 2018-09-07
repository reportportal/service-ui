## **Toggle button**

Has no own size. Width and Height = 100% of it's container.

> "value" prop should be equal to one of items value.

### Props:

- **items**: _array_ of { value: _string_, label: _string_ }, optional, default = []
- **value**: _string_, optional, default = ""
- **mobileDisabled**: _bool_, optional, default = false
- **disabled**: _bool_, optional, default = false

### Events:

- **onClickItem** - returns clicked item value

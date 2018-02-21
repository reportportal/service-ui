## **Toggle button**

Has no own size. Width and Height = 100% of it's container. 

### Props:
* **items**: _array_ of { value: _string_, label: _string_ }, optional, default = []
* **value**: _string_, optional, default = ""
* **onChange**: _func_, optional, default = () => {}

### Events:
* **onClickItem** - returns clicked item value

> "value" prop should be equal to one of items value.

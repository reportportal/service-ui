### **AsyncAutocomplete component**

Has no own size. Width = 100% of it's parent.

## Props:

- **`options`**: `array. Default: []`. The list of options.
- **`value`**: `any. Default: ''.` Selected option.
- **`placeholder`**: `string. Default: ''.` Input placeholder.
- **`creatable`**: `boolean. Default: false.` Defines user possibility to create new option.
- **`onChange`**: `function.` Function which get selected value on select option.
- **`makeOptions`**: `function. Default: (values) => values.` Function gets result from server. Should return array of options.
- **`isValidNewOption`**: `function. Default: () => true.` Function which get new value. Return true if user can create new option.
- **`minLength`**: `number. Default: 1.` Minimum length for starting searching.
- **`disabled`**: `boolean. Default: false.` Defines if autocomplete is disabled.
- **`filterOption`**: `function. Default: () => true.` Function with can filter options in the list. Should return true if option should be included in the search result.
- **`parseValueToString`**: `function. Default: (value) => value.` Function wich gets value and should return its string representation.
- **`renderOption`**: `function.` Function wich perform custom render of option
- **`createNewOption`**: `function. Default: null.` Function wich create new value from input value

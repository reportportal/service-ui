## **InputTagsSearch component**

Has no own size. Width = 100% of it's parent. Allows to select many items. Component use react-select library. https://github.com/JedWatson/react-select


Has props:
1. uri - url for request to get items,
2. options - should be provided as an Array of Objects, each with a value and label property for rendering and searching.
3. values - array of selected by default options.
4. focusPlaceholder - uses in Async component, label to prompt for search input.
5. loadingPlaceholder -  label to prompt for loading search result.
6. nothingFound - placeholder displayed when there are no matching search results or a falsy value to hide it (can also
be a react component).
7. creatable - defines user possibility to create new option.
8. async - make component asynchronous, allows loading items using uri.
9. multi - allows select many items.
10. removeSelected - allows remove selected option from option list.
11. onChange - function which get object {value:string, label: string}.
12. makeOptions - function gets result from server. Should return array of options.
13. isValidNewOption - gets minLength, validate function and option label as arguments. Return true if user can create
new option.
14. minLength - minimum length for starting searching.
15. showNewLabel - show 'New' label when component is Creatable
16. dynamicSearchPromptText - allow dynamic creation of search label

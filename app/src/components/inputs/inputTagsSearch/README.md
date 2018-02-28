## **InputTagsSearch component**

Has no own size. Width = 100% of it's parent. Allows to select many items. Component use react-select library. https://github.com/JedWatson/react-select<br/>
Has props:<br/>
uri - url for request to get items,<br/>
options - should be provided as an Array of Objects, each with a value and label property for rendering and searching.<br/>
values - array of selected by default options,<br/>
focusPlaceholder - uses in Async component, label to prompt for search input,<br/>
loadingPlaceholder -  label to prompt for loading search result,<br/>
nothingFound - placeholder displayed when there are no matching search results or a falsy value to hide it (can also be a react component),<br/>
isCreatable - defines user possibility to create new option,<br/>
isAsync - make component asynchronous, allows loading items using uri,<br/>
multi - allows select many items,<br/>
removeSelected - allows remove selected option from option list,<br/>
selectItem - function which get object {value:string, label: string},<br/>
makeOptions - function gets result from server. Should return array of options,<br/>
isValidNewOption - gets minLength, validate function and option label as arguments. Return true if user can create new option,<br/>
validation - function get label of option and return true or false,<br/>
minLength - minimum length for starting searching<br/>
showNewLabel - show 'New' label when component is Creatable<br/>
dynamicSearchPromptText - allow dynamic creation of search label

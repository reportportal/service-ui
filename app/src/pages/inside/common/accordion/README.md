## **Accordion component**

Has height and width adjusted by content.
By default, all tabs a collapsed.
Only one tab can be open at the same time.
Have no paddings, margins, background.
Content align by tab title.

### Props:

- **renderedData**: _array_ [{title<text | component>, content<text | component>}]
- **firstTabActive**: _boolean_, optional, default = false
- **headerClassNames**: _string_, optional, default = ''
- **contentClassNames**: _string_, optional, default = ''

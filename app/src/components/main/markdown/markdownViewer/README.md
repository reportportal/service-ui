## **Component for presentation of formatted by markdown text**

Has no own size. Width = 100% of it's parent, Height calculating by content.

### Props (main):

- **text**: _string_, optional, default = ''
- **onResize**: _function_, optional, default = () => {}

> If your markdown text contains images, each time when image become loaded, onResize callback will be called.

> Images max-size = 300px x 300px

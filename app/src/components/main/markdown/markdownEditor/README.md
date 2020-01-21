## **Component for formatting text by markdown.**

Width = 100% of it's parent, Max-height ~= 615px.

> For preview presentation uses MarkdownViewer component.

### Props (main):

- **text**: _string_, optional, default = ''
- **placeholder**: _string_, optional, default = ''
- **Change**: _function_, optional, default = () => {}

> If your markdown text contains images, each time when image become loaded in preview mode, onResize callback will be
> called.

> Images max-size = 300px x 300px

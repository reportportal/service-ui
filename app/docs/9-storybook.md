# Storybook

All common components should have their corresponding stories.

Storybook structure:

```
- Components - place for common components
- Layouts - place for common layouts
- Pages - place for page-related components
```

## Writing stories

A component should have the following stories:

- `default state` - a component without any props passed (if it possible)
- `with actions` - a component with event handlers (use `action` from `@storybook/addon-actions`)

Other stories depend on component's props.

Also, please add `README.md` and import it into the story.

_If you have to mock a big chunk of data, please put it into a separate file._

## Storybook decorators

Common decorators can be found in `.storybook/decorators` and imported like this:

```
// eslint-disable-next-line import/extensions, import/no-unresolved
import { WithState } from 'storybook-decorators';
```

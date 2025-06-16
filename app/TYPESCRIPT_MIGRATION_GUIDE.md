# TypeScript Migration Guide

This guide provides step-by-step instructions for migrating React components from JSX with PropTypes to TypeScript (TSX) while maintaining backward compatibility.

## Overview

The migration strategy allows for gradual adoption:

- **Mixed Environment**: Both `.jsx` and `.tsx` files can coexist
- **No Breaking Changes**: Existing JSX components continue to work
- **Incremental Migration**: Convert components one at a time
- **Type Safety**: Gain TypeScript benefits without disrupting workflow

## Migration Steps

### 1. Component Props Migration

#### Before (JSX with PropTypes):

```jsx
import PropTypes from 'prop-types';

const MyComponent = ({ title, items, onItemClick, loading }) => {
  // Component implementation
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  onItemClick: PropTypes.func,
  loading: PropTypes.bool,
};

MyComponent.defaultProps = {
  items: [],
  onItemClick: () => {},
  loading: false,
};
```

#### After (TSX with TypeScript):

```tsx
interface MyComponentProps {
  title: string;
  items?: string[];
  onItemClick?: (item: Record<string, any>) => void;
  loading?: boolean;
}

const MyComponent = ({
  title,
  items = [],
  onItemClick = () => {},
  loading = false,
}: MyComponentProps) => {
  // Component implementation
};
```

### 2. State and Hooks Migration

#### Before (Class Component):

```jsx
class MyComponent extends Component {
  static propTypes = {
    initialData: PropTypes.array,
  };

  state = {
    data: [],
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true });
    try {
      const data = await api.getData();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };
}
```

#### After (Functional Component with Hooks):

```tsx
interface MyComponentProps {
  initialData?: string[];
}

interface ComponentState {
  data: string[];
  loading: boolean;
  error: string | null;
}

const MyComponent = ({ initialData = [] }: MyComponentProps) => {
  const [state, setState] = useState<ComponentState>({
    data: initialData,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.getData();
      setState((prev) => ({ ...prev, data, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
};
```

### 3. Event Handlers Migration

#### Before:

```jsx
MyComponent.propTypes = {
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};
```

#### After:

```tsx
interface MyComponentProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => Promise<void>;
}
```

### 4. Redux Integration Migration

#### Before:

```jsx
const mapStateToProps = (state) => ({
  user: state.user,
  loading: state.loading,
});

const mapDispatchToProps = {
  fetchUser,
  updateUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```

#### After:

```tsx
import { RootState } from 'types/store';

interface StateProps {
  user: User;
  loading: boolean;
}

interface DispatchProps {
  fetchUser: (id: string) => void;
  updateUser: (user: User) => void;
}

type MyComponentProps = StateProps &
  DispatchProps & {
    // Additional props
  };

const mapStateToProps = (state: RootState): StateProps => ({
  user: state.user,
  loading: state.loading,
});

const mapDispatchToProps: DispatchProps = {
  fetchUser,
  updateUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);
```

### 5. Form Components Migration

#### Before:

```jsx
const FormComponent = ({ input, meta, ...props }) => (
  <div>
    <input {...input} {...props} />
    {meta.touched && meta.error && <span>{meta.error}</span>}
  </div>
);

FormComponent.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
};
```

#### After:

```tsx
import { FieldInput, FieldMeta } from 'types';

interface FormComponentProps {
  input: FieldInput<string>;
  meta: FieldMeta;
  placeholder?: string;
  disabled?: boolean;
}

const FormComponent = ({
  input,
  meta,
  placeholder,
  disabled,
  ...props
}: FormComponentProps) => (
  <div>
    <input {...input} placeholder={placeholder} disabled={disabled} {...props} />
    {meta.touched && meta.error && (
      <span className="error">
        {typeof meta.error === 'string' ? meta.error : meta.error.message}
      </span>
    )}
  </div>
);
```

## Common Patterns

### 1. Optional Props with Defaults

```tsx
interface ComponentProps {
  required: string;
  optional?: number;
}

const Component = ({ required, optional = 42 }: ComponentProps) => {
  // Use destructuring with defaults
};
```

### 2. Children Props

```tsx
interface Props {
  children: ReactNode;
  // or for specific children types:
  children: ReactElement<SomeProps>;
}
```

### 3. Render Props

```tsx
interface Props {
  render: (data: SomeData) => ReactNode;
  // or
  children: (data: SomeData) => ReactNode;
}
```

### 4. Generic Components

```tsx
interface GenericListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

function GenericList<T>({ items, renderItem }: GenericListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### 5. Extending HTML Element Props

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

const Button = ({
  variant = 'primary',
  loading = false,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={`btn btn-${variant} ${loading ? 'loading' : ''}`}
    disabled={loading}
    {...props}
  >
    {children}
  </button>
);
```

## Migration Checklist

### For Each Component:

1. **Create Interface**: Define props interface replacing PropTypes
2. **Add Type Annotations**: Add proper type annotations for props
3. **Handle Defaults**: Use destructuring defaults instead of defaultProps
4. **Update Event Handlers**: Add proper event types
5. **State Typing**: Add interfaces for component state
6. **Redux Typing**: Type mapStateToProps and mapDispatchToProps
7. **Import Types**: Import shared types from types directory
8. **Remove PropTypes**: Remove PropTypes imports and definitions
9. **Test**: Ensure component works with TypeScript compiler
10. **Rename File**: Change .jsx to .tsx

### Project-wide:

1. **Install Dependencies**: Add TypeScript and type definitions
2. **Configure TypeScript**: Set up tsconfig.json
3. **Update Build Tools**: Configure webpack and babel
4. **Update Linting**: Configure ESLint for TypeScript
5. **Create Type Definitions**: Add shared types
6. **Update Scripts**: Add type-checking scripts
7. **Documentation**: Update README and guides

## Best Practices

### 1. Start with Leaf Components

Begin migration with components that don't have children components to avoid dependency issues.

### 2. Use Strict Types

Avoid `any` type when possible. Use specific types or unions.

```tsx
// Bad
const handleData = (data: any) => {};

// Good
const handleData = (data: User | Project | null) => {};
```

### 3. Leverage Type Inference

Let TypeScript infer types when possible to reduce verbosity.

```tsx
// TypeScript can infer the return type
const formatDate = (date: Date) => date.toISOString();
```

### 4. Use Utility Types

Leverage TypeScript utility types for common patterns.

```tsx
// Pick specific properties
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// Make all properties optional
type PartialUser = Partial<User>;

// Make specific properties required
type RequiredUser = Required<Pick<User, 'id' | 'name'>>;
```

### 5. Document Complex Types

Add comments for complex type definitions.

```tsx
/**
 * Configuration for grid row highlighting
 * Used to highlight specific rows based on various conditions
 */
interface RowHighlightingConfig {
  /** Callback when a row is highlighted */
  onGridRowHighlighted?: () => void;
  /** Whether any row is currently highlighted */
  isGridRowHighlighted?: boolean;
  /** ID of the currently highlighted row */
  highlightedRowId?: string | number;
}
```

## Troubleshooting

### Common Issues:

1. **Import Errors**: Ensure path aliases are configured in tsconfig.json
2. **Type Conflicts**: Check for conflicting type definitions
3. **Build Errors**: Verify webpack configuration includes .ts/.tsx extensions
4. **Linting Issues**: Update ESLint configuration for TypeScript files

### Migration Order:

1. Utility functions and constants
2. Type definitions and interfaces
3. Leaf components (no children)
4. Container components
5. Page components
6. Route components

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Redux TypeScript Guide](https://redux.js.org/usage/usage-with-typescript)

## Support

For questions or issues during migration:

1. Check this guide first
2. Review existing TypeScript components for patterns
3. Consult team TypeScript experts
4. Create issues for complex migration scenarios

import React from 'react';

// Shared props for form components, encapsulates the props passed to FormItem
interface FormSharedProps extends React.PropsWithChildren {
  // common form item props
  variant?: string;
  joinable?: boolean;
  required?: boolean;

  // autocomplete related props
  autocompleteId?: string; // unique id for autocomplete
}
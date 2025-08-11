import type { Route } from "./+types/inputsEditor";
import React from 'react';
import Column from '../components/containers/Column';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import InlineCode from '../components/text/InlineCode';
import InputEditor from '../components/inputs/InputEditor';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Input Editor" },
    { name: "description", content: "InputEditor Demo" },
  ];
}

export default function Component() {
  const [basicValue, setBasicValue] = React.useState('// Example JavaScript\nfunction hello(name = "world") {\n  const message = `Hello, ${name}!`;\n  console.log(message);\n  return message;\n}\n\n// Call the function\nhello("React");\nhello();\n\n// Try pressing Tab for indentation!');
  const [noGutterValue, setNoGutterValue] = React.useState('This editor has no line numbers\nJust plain text editing\nMultiple lines supported\nSyntax highlighting still works!\nPress Tab to indent text');
  const [jsonValue, setJsonValue] = React.useState('{\n  "name": "example-project",\n  "version": "1.0.0",\n  "description": "A demo project",\n  "scripts": {\n    "start": "node index.js",\n    "test": "jest",\n    "build": "webpack"\n  },\n  "dependencies": {\n    "react": "^18.0.0",\n    "typescript": "^5.0.0"\n  },\n  "devDependencies": {\n    "jest": "^29.0.0"\n  }\n}');

  return (
    <Column>
      <Card color="var(--riv-purple)">
        <Slot name="title">InputEditor Demo</Slot>
      </Card>

      <Card border>
        <Slot name="subtitle">Basic Editor</Slot>
        <Slot name="description">Fixed cursor alignment, scrolling, and Tab key support for indentation</Slot>
        <InputEditor 
          value={basicValue} 
          onUpdate={setBasicValue}
          placeholder="Enter your code here..."
        >
          <Slot name="label">JavaScript Code</Slot>
          <Slot name="description">Press Tab to indent, scroll to test alignment</Slot>
        </InputEditor>
      </Card>

      <Card border>
        <Slot name="subtitle">Without Line Numbers</Slot>
        <Slot name="description">Use <InlineCode>showLineNumbers={'{false}'}</InlineCode> to hide the gutter</Slot>
        <InputEditor 
          value={noGutterValue} 
          onUpdate={setNoGutterValue}
          showLineNumbers={false}
          placeholder="Plain text editor..."
        >
          <Slot name="label">Plain Text</Slot>
        </InputEditor>
      </Card>

      <Card border>
        <Slot name="subtitle">JSON Editor</Slot>
        <Slot name="description">Great for configuration files and structured data</Slot>
        <InputEditor 
          value={jsonValue} 
          onUpdate={setJsonValue}
          placeholder="Enter JSON..."
        >
          <Slot name="label">Package.json</Slot>
          <Slot name="description">Edit your package configuration</Slot>
        </InputEditor>
      </Card>

      <Card border>
        <Slot name="subtitle">Disabled State</Slot>
        <Slot name="description">Read-only editor with <InlineCode>disabled</InlineCode> prop</Slot>
        <InputEditor 
          value="This editor is disabled\nYou can't edit this content\nBut you can still select and copy"
          disabled
        >
          <Slot name="label">Read-only Code</Slot>
        </InputEditor>
      </Card>
    </Column>
  );
}

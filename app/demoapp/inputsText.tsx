import type { Route } from "./+types/inputsText";
import React from 'react';

import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import InputText from '../components/inputs/InputText';
import InlineCode from '../components/text/InlineCode';
import Title from '../components/text/Title';
import Icon from '../components/icons/Icon';

import Button from '../components/buttons/Button';
import Toggle from '../components/buttons/Toggle';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inputs | Text" },
    { name: "description", content: "Demo of Text Inputs" },
  ];
}

export default function Component() {
  const [inputBuffer, setInputBuffer] = React.useState<string>('');

  // example of how to handle keyup
  const onKeyUpTest = function(e: React.KeyboardEvent<HTMLInputElement>) {
    console.log(e.code);
  };

  return (
    <Column>
      <Card color="var(--riv-green)">
        <Slot name="title">Inputs - Text</Slot>
      </Card>

      <Card>
        <Slot name="title">&lt;InputText/&gt;</Slot>
        <Slot name="subtitle">Text input</Slot>

        <Column>
          <Row>
            <Card border>
              <Slot name="subtitle">Regular</Slot>
              <Slot name="description">The default variant</Slot>
              <Row>
                <InputText value={''} placeholder="Placeholder">
                </InputText>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Shaded</Slot>
              <Slot name="description">The shaded variant</Slot>
              <Row>
                <InputText value={''} variant="shaded"/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Clean</Slot>
              <Slot name="description">The clean variant</Slot>
              <Row>
                <InputText value={''} placeholder="text" variant="clean"/>
              </Row>
            </Card>
          </Row>
          <Title variant="h1" hr margins>Sizes</Title>
          <Row>
            <Card border>
              <Slot name="subtitle">Small</Slot>
              <Slot name="description">The <InlineCode>sm</InlineCode> size</Slot>
              <Row>
                <InputText value={''} placeholder="text" size="sm"/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Medium (default)</Slot>
              <Slot name="description">The <InlineCode>md</InlineCode> size</Slot>
              <Row>
                <InputText value={''} placeholder="text" size="md"/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Large</Slot>
              <Slot name="description">The <InlineCode>lg</InlineCode> size</Slot>
              <Row>
                <InputText value={''} placeholder="text" size="lg"/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">X-Large</Slot>
              <Slot name="description">The <InlineCode>xl</InlineCode> size</Slot>
              <Row>
                <InputText value={''} placeholder="text" size="xl"/>
              </Row>
            </Card>
          </Row>

          <Title variant="h1" hr margins>Options</Title>
          <Row>
            <Card border>
              <Slot name="subtitle">Right Justified</Slot>
              <Slot name="description">Set <InlineCode>right</InlineCode> prop for right-justification</Slot>
              <Row>
                <InputText value={''} right grow placeholder="Right"/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Center Justified</Slot>
              <Slot name="description">Set <InlineCode>center</InlineCode> prop for center-justification</Slot>
              <Row>
                <InputText value={''} grow center placeholder="Centered"/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Clearable</Slot>
              <Slot name="description">Set <InlineCode>clearable</InlineCode> prop for a built-in clear button</Slot>
              <Row>
                <InputText value={inputBuffer} onUpdate={(d) => setInputBuffer(d)} grow clearable/>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Label</Slot>
              <Slot name="description">Provide a <InlineCode>label</InlineCode> slot for a formal label</Slot>
              <Column>
                <InputText value={inputBuffer} grow variant="clean" right placeholder="text"
                           onUpdate={(d) => setInputBuffer(d)}
                           onKeyUp={onKeyUpTest}
                           clearable>
                  <Slot name="label">
                    My Label
                  </Slot>
                </InputText>
                <InputText value={inputBuffer} grow placeholder="text"
                           onUpdate={(d) => setInputBuffer(d)}
                           onKeyUp={onKeyUpTest}
                           clearable>
                  <Slot name="label">
                    My Label
                  </Slot>
                </InputText>
                <InputText value={inputBuffer} grow variant="shaded" placeholder="text"
                           onUpdate={(d) => setInputBuffer(d)}
                           onKeyUp={onKeyUpTest}
                           clearable>
                  <Slot name="label">
                    My Label
                  </Slot>
                </InputText>
              </Column>
            </Card>
            <Card border>
              <Slot name="subtitle">Icon Slot</Slot>
              <Slot name="description">Provide the <InlineCode>icon</InlineCode> slot for a leading icon</Slot>
              <Row>
                <InputText value={inputBuffer} onUpdate={(d) => setInputBuffer(d)}>
                  <Slot name="icon">
                    <Icon name="button"/>
                  </Slot>
                </InputText>
              </Row>
            </Card>
            <Card border>
              <Slot name="subtitle">Units Slot</Slot>
              <Slot name="description">
                Provide the <InlineCode>units</InlineCode> slot for adding units or any post-value component
              </Slot>
              <Row>
                <InputText value={inputBuffer} onUpdate={(d) => setInputBuffer(d)}>
                  <Slot name="units">cm</Slot>
                </InputText>
              </Row>
            </Card>
          </Row>
        </Column>
      </Card>

    </Column>
  );
}

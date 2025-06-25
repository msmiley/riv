import type { Route } from "./+types/buttons";
import { useState } from 'react';
import type { Route } from "./+types/buttons";

import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Toggle from '../components/buttons/Toggle';
import Icon from '../components/icons/Icon';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Buttons" },
    { name: "description", content: "Buttons Demo Page" },
  ];
}

export default function Component() {

  const [clickState, setClickState] = useState(false);

  // example toggle function
  function toggleClickState() {
    setClickState(!clickState);
  }

  return (
    <Column>
      <Card>
        <Slot name="title">Buttons</Slot>
        <Row>
          <Card>
            <Slot name="subtitle">Click State</Slot>
            { clickState ? 'clicked':'not clicked' }
          </Card>
        </Row>

      </Card>
      <Card>
        <Slot name="title">&lt;Button/&gt;</Slot>
        <Slot name="subtitle">Button provides a clickable button with these variants</Slot>

        <Row>
          <Card border>
            <Slot name="subtitle">Basic</Slot>
            <Slot name="description">The default mode for a button</Slot>
            <Row>
              <Button onClick={() => setClickState(!clickState)}>
                <Icon name="button"></Icon>
                Button
              </Button>
            </Row>
          </Card>
          <Card border>
            <Slot name="subtitle">Outline</Slot>
            <Slot name="description">Use an outline-style by setting variant="outline"</Slot>
            <Row>
              <Button color="success" variant="outline" onClick={toggleClickState}>
                <Icon name="save"></Icon>
                Button
              </Button>
            </Row>
          </Card>
          <Card border>
            <Slot name="subtitle">Link</Slot>
            <Slot name="description">For a button which looks like a link, use variant="link"</Slot>
            <Row>
              <Button variant="link" onClick={toggleClickState}>
                Link
              </Button>
            </Row>
          </Card>
        </Row>
      </Card>
      <Card>
        <Slot name="title">&lt;Toggle/&gt;</Slot>
        <Slot name="subtitle">A switch-style button</Slot>

        <Row>
          <Card border>
            <Slot name="subtitle">Basic</Slot>
            <Slot name="description">The default mode for a toggle</Slot>
            <Row>
              <Toggle active={clickState} onClick={() => setClickState(!clickState)}>
                <Slot name="title">title Slot</Slot>
              </Toggle>
            </Row>
          </Card>
        </Row>
      </Card>
    </Column>
  );
}

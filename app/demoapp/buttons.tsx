import { useState } from 'react';
import type { Route } from "./+types/buttons";

import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Icon from '../components/icons/Icon';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Buttons" },
    { name: "description", content: "Buttons Demo Page" },
  ];
}

export default function Buttons() {

  const [clickState, setClickState] = useState(false);

  // example toggle function
  function toggleClickState() {
    setClickState(!clickState);
  }

  return (
    <Column>
      <Card>
        <Slot name="title">Buttons</Slot>
      </Card>
      <Card>
        <Slot name="subtitle">Examples of the various button variants available in riv</Slot>

        <Row>
          <Card>
            <Slot name="subtitle">Basic</Slot>
            <Button onClick={() => setClickState(!clickState)}>
              <Icon name="button"></Icon>
              Button
            </Button>
          </Card>
          <Card>
            <Slot name="subtitle">Outline</Slot>
            <Button color="success" variant="outline" onClick={toggleClickState}>
              <Icon name="save"></Icon>
              Button
            </Button>
          </Card>
          <Card>
            <Slot name="subtitle">Link</Slot>
            <Row>
              <Button variant="link" onClick={toggleClickState}>
                Link
              </Button>
            </Row>
          </Card>
        </Row>

        <Row>
          <Card>
            <Slot name="subtitle">Click State Demo</Slot>
            { clickState ? 'clicked':'not clicked' }
          </Card>
        </Row>
      </Card>
    </Column>
  );
}

import type { Route } from "./+types/buttons";
import { useState } from 'react';
import type { Route } from "./+types/buttons";

import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Toggle from '../components/buttons/Toggle';
import Pill from '../components/buttons/Pill';
import InlineCode from '../components/text/InlineCode';
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

      <Card>
        <Slot name="title">&lt;Pill/&gt;</Slot>
        <Slot name="subtitle">A pill-style button with ability to show 2-level data</Slot>

        <Row>
          <Card border>
            <Slot name="subtitle">Basic</Slot>
            <Slot name="description">The default mode for a pill</Slot>
            <Column>
              <Row center>
                <InlineCode>size="sm"</InlineCode>
                <Pill size="sm" onClick={() => setClickState(!clickState)}>
                  <Slot name="title">title Slot</Slot>
                  <Slot name="value">value Slot</Slot>
                </Pill>
              </Row>
              <Row center>
                <InlineCode>size="md"</InlineCode>
                <Pill onClick={() => setClickState(!clickState)}>
                  <Slot name="title">title Slot</Slot>
                  <Slot name="value">value Slot</Slot>
                </Pill>
              </Row>
              <Row center>
                <InlineCode>size="lg"</InlineCode>
                <Pill size="lg" onClick={() => setClickState(!clickState)}>
                  <Slot name="title">title Slot</Slot>
                  <Slot name="value">value Slot</Slot>
                </Pill>
              </Row>
            </Column>
          </Card>
          <Card border>
            <Slot name="subtitle">Color</Slot>
            <Slot name="description">Use color to make a splash</Slot>
            <Column>
              <Row center>
                <InlineCode>color="red"</InlineCode>
                <Pill size="sm" color="red" onClick={() => setClickState(!clickState)}>
                  <Slot name="title">title Slot</Slot>
                  <Slot name="value">value Slot</Slot>
                </Pill>
              </Row>
              <Row center>
                <InlineCode>color="var(--riv-plum)"</InlineCode>
                <Pill color="var(--riv-plum)" onClick={() => setClickState(!clickState)}>
                  <Slot name="title">title Slot</Slot>
                  <Slot name="value">value Slot</Slot>
                </Pill>
              </Row>
              <Row center>
                <InlineCode>color="#0cb424"</InlineCode>
                <Pill size="lg" color="#0cb424" onClick={() => setClickState(!clickState)}>
                  <Slot name="title">title Slot</Slot>
                  <Slot name="value">value Slot</Slot>
                </Pill>
              </Row>
            </Column>
          </Card>
        </Row>
      </Card>
    </Column>
  );
}

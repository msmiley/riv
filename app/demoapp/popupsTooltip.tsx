import type { Route } from "./+types/popupsTooltip";
import Column from "../components/containers/Column";
import Row from "../components/containers/Row";
import Card from "../components/containers/Card";
import Slot from "../components/slots/Slot";
import Button from "../components/buttons/Button";
import Tooltip from "../components/popups/Tooltip";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tooltip" },
    { name: "description", content: "Demo of Tooltip popup component" },
  ];
}

export default function Component() {
  return (
    <Column>
      <Card>
        <Slot name="title">Tooltip Demo</Slot>
      </Card>

      <Row>
        <Card border grow>
          <Slot name="subtitle">Basic Tooltip</Slot>
          <Slot name="description">Hover over the triggers to show tooltips.</Slot>
          <Row gap="12px" align="center">
            <Tooltip content="I am a tooltip!">
              <Button onClick={() => {}}>Hover me</Button>
            </Tooltip>
            <Tooltip content={<span>Custom <b>rich</b> content</span>}>
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Text trigger</span>
            </Tooltip>
          </Row>
        </Card>
      </Row>

      <Row>
        <Card border grow>
          <Slot name="subtitle">Preferred Placement</Slot>
          <Slot name="description">Tooltip arrow style toggles with placement; content auto-flips if needed. Hover to test.</Slot>
          <Row justify="space-between" align="center">
            <Tooltip placement="top" content="Preferred top">
              <Button onClick={() => {}}>Top</Button>
            </Tooltip>
            <Tooltip placement="bottom" content="Preferred bottom">
              <Button onClick={() => {}}>Bottom</Button>
            </Tooltip>
          </Row>
        </Card>
      </Row>

      <Row>
        <Card border grow>
          <Slot name="subtitle">Edge Positioning</Slot>
          <Slot name="description">Tooltips adjust position near viewport edges but keep arrows pointing to trigger center.</Slot>
          <Row justify="space-between" align="center">
            <Tooltip content="Left edge tooltip">
              <Button onClick={() => {}}>Left Edge</Button>
            </Tooltip>
            <Tooltip content="Right edge tooltip with longer content">
              <Button onClick={() => {}}>Right Edge</Button>
            </Tooltip>
          </Row>
        </Card>
      </Row>

      <Row>
        <Card border grow>
          <Slot name="subtitle">Custom Delay</Slot>
          <Slot name="description">Tooltips can have custom show delays. Default is 500ms.</Slot>
          <Row justify="space-between" align="center">
            <Tooltip delay={0} content="No delay">
              <Button onClick={() => {}}>Instant</Button>
            </Tooltip>
            <Tooltip delay={1000} content="1 second delay">
              <Button onClick={() => {}}>Slow</Button>
            </Tooltip>
          </Row>
        </Card>
      </Row>
    </Column>
  );
}

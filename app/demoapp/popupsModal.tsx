import type { Route } from './+types/popupsModal';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Button from '../components/buttons/Button';
import Modal from '../components/popups/Modal';
import type { PopupCloseSlotProps, PopupTriggerSlotProps } from '~/types';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Modal" },
    { name: "description", content: "Demo of Modal popup component" },
  ];
}

export default function Component() {
  return (
    <Column>
      <Card>
        <Slot name="title">Modal Demo</Slot>
      </Card>

      <Row>
        <Card border grow>
          <Slot name="subtitle">Basic Modal</Slot>
          <Slot name="description">
            Click the button to open the modal. Click outside or press Escape to close.
          </Slot>
          <Row>
            <Modal>
              <Slot name="trigger">
                {({ onClick }: PopupTriggerSlotProps) => (
                  <Button onClick={onClick}>Open Modal</Button>
                )}
              </Slot>
              <Slot name="title">Modal Title</Slot>
              <Slot name="default">
                <div>This is the modal content area.</div>
              </Slot>
              <Slot name="buttons">
                {({ onClose }: PopupCloseSlotProps) => (
                  <Button onClick={onClose}>Close</Button>
                )}
              </Slot>
            </Modal>
          </Row>
        </Card>
      </Row>
    </Column>
  );
}

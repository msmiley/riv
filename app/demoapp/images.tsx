import React from 'react';
import Row from '~/components/containers/Row';
import Column from '~/components/containers/Column';
import Card from '~/components/containers/Card';
import Image from '~/components/images/Image';
import Slot from '~/components/slots/Slot';

export default function ImagesDemo() {
  return (
    <Column gap="lg">
      <h1>Image</h1>
      <p>Responsive image that fills its container while preserving aspect ratio. Supports circle mask, raw mode, and width/height prioritization.</p>

      <Row gap="lg">
        <div style={{ width: 240 }}>
          <Card>
            <Slot name="title">Cover (default)</Slot>
            <div style={{ width: '100%', height: 160 }}>
              <Image src="/default-user.jpg" alt="cover" />
            </div>
          </Card>
        </div>

        <div style={{ width: 240 }}>
          <Card>
            <Slot name="title">Fill Width</Slot>
            <Image src="/default-user.jpg" fillWidth alt="fill width" />
          </Card>
        </div>

        <div style={{ height: 160 }}>
          <Card>
            <Slot name="title">Fill Height</Slot>
            <div style={{ width: 120, height: '100%' }}>
              <Image src="/default-user.jpg" fillHeight alt="fill height" />
            </div>
          </Card>
        </div>
      </Row>

      <Row gap="lg">
        <div style={{ width: 120 }}>
          <Card>
            <Slot name="title">Circle Avatar</Slot>
            <div style={{ width: 120, height: 120 }}>
              <Image src="/default-user.jpg" circle alt="avatar" />
            </div>
          </Card>
        </div>

        <div style={{ width: 240 }}>
          <Card>
            <Slot name="title">Raw (natural)</Slot>
            <Image src="/default-user.jpg" raw alt="raw" />
          </Card>
        </div>

        <div style={{ width: 120 }}>
          <Card>
            <Slot name="title">Min size (96)</Slot>
            <div style={{ width: 120, height: 120 }}>
              <Image src="/default-user.jpg" min={96} alt="min size" />
            </div>
          </Card>
        </div>
      </Row>
    </Column>
  );
}

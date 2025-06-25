import type { Route } from "./+types/colors";

import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import GeoPattern from '../components/misc/GeoPattern';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Colors" },
    { name: "description", content: "Colors Demo" },
  ];
}

export default function Component() {
  const colorVars = [
    '--riv-indigo',
    '--riv-purple',
    '--riv-plum',
    '--riv-lavender',

    '--riv-magenta',
    '--riv-pink',
    '--riv-watermelon',
    '--riv-salmon',

    '--riv-prussian',
    '--riv-navy',
    '--riv-royal',
    '--riv-blue',
    '--riv-cobalt',
    '--riv-cyan',
    '--riv-teal',

    '--riv-green',
    '--riv-emerald',
    '--riv-yellow',
    '--riv-gold',

    '--riv-orange',
    '--riv-brick',
    '--riv-red',
    '--riv-crimson',
    '--riv-scarlet',
  ];
  const grayScale = [
    '--riv-white',
    '--riv-light',
    '--riv-light-med',
    '--riv-gray',
    '--riv-gray-med',
    '--riv-gray-dark',
    '--riv-dark',
    '--riv-darker',
    '--riv-black',
  ];
  const semanticColors = [
    '--riv-primary',
    '--riv-muted-primary',
    '--riv-secondary',
    '--riv-muted-secondary',
    '--riv-success',
    '--riv-muted-success',
    '--riv-info',
    '--riv-muted-info',
    '--riv-warning',
    '--riv-muted-warning',
    '--riv-danger',
    '--riv-muted-danger',
    '--riv-content-bg',
    '--riv-widget-dark-bg',
    '--riv-widget-light-bg',
    '--riv-field-bg',
    '--riv-popup-bg',
    '--riv-popup-fg',
    '--riv-selection',
    '--riv-outline',
    '--riv-active',
    '--riv-hover',
  ];
  const textColors = [
    '--riv-text-color',
    '--riv-text-color-secondary',
    '--riv-text-color-muted',
    '--riv-text-color-inverse',
  ];

  return (
    <Column>
      <Card color="var(--riv-blue)">
        <Slot name="title">Colors</Slot>
      </Card>

      <Card color="var(--riv-green)">
        <Slot name="title">Geopattern</Slot>
        <Slot name="description">riv also provides a component: GeoPattern which will set its background to a generated geometric pattern based on the content or a seed given through a property.</Slot>
        <GeoPattern seed="test">
          Test
        </GeoPattern>
      </Card>

      <Card color="var(--riv-brick)">
        <Slot name="title">CSS Colors</Slot>
        <Slot name="description"><span>viv provides many pre-defined CSS vars for a rainbow of colors. Any of these may be redefined in your app by setting them on <em>.viv-app</em>. These color names can be obtained for use in a palette by calling the <em>vivColorPalette()</em> mixin.</span></Slot>
        <Row gap>
          {colorVars.map((item, i) =>
            <Card cols="3" key="i.toString()">
              <div class="riv-color-chip" style={{
                backgroundColor: `var(${item})`
              }}>
                {item}
              </div>
            </Card>
          )}
        </Row>
      </Card>

      <Card>
        <Slot name="subtitle">And the grayscale</Slot>
        <Row gap>
          {grayScale.map((item, i) =>
            <Card cols="3" key={i.toString()}>
              <div class="riv-color-chip" style={{
                backgroundColor: `var(${item})`
              }}>
                {item }
              </div>
            </Card>
          )}
        </Row>
      </Card>

      <Card>
        <Slot name="subtitle">Some of the above are aliased using semantic variant names</Slot>
        <Row gap>
          {semanticColors.map((item, i) =>
            <Card cols="3" key="i.toString()">
              <div class="riv-color-chip" style={{
                backgroundColor: `var(${item})`
              }}>
                {item }
              </div>
            </Card>
          )}
        </Row>
      </Card>

      <Card>
        <Slot name="subtitle">...and text colors</Slot>
        <Row gap>
          {textColors.map((item, i) =>
            <Card cols="3" key="i.toString()">
              <div class="riv-color-chip" style={{
                color: 'white',
                backgroundColor: `var(${item})`
              }}>
                {item}
              </div>
            </Card>
          )}
        </Row>
      </Card>

      <Card>
        <Slot name="subtitle"><span>Viv also provides <em>vivChartColorGenerator()</em> a color palette generator for chart colors that works with either numbers or strings as a seed.</span></Slot>
        {Object.keys(Array(10)).map((item, i) =>
          <Card cols="3" key="i.toString()">
            <div class="riv-color-chip" style={{
              color: 'white',
              backgroundColor: i,
            }}>
              {i}
            </div>
          </Card>
        )}
      </Card>
    </Column>
  );
}

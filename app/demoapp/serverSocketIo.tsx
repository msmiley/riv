import React from 'react';
import type { Route } from "./+types/serverSocketIo";

import Column from '../components/containers/Column';
import CenteredColumn from '../components/layouts/CenteredColumn';
import Row from '../components/containers/Row';
import Card from '../components/containers/Card';
import Slot from '../components/slots/Slot';
import Form from '../components/forms/Form';
import FormInputText from '../components/forms/FormInputText';
import FormItem from '../components/forms/FormItem';


import Button from '../components/buttons/Button';

import useRiv from '../hooks/useRiv';


// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Server | Socket.io" },
    { name: "description", content: "Demo of Socket.io Transport" },
  ];
}

export default function Component() {
  const riv = useRiv();

  const [api, setApi] = React.useState('');
  // send
  const onSend = (e: React.FormEvent<HTMLFormElement>) => {
    riv.apiCall(api).then((d) => {
      console.log('date', d)
    });
  };

  const onToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };


  return (
    <Column>
      <Card color="var(--riv-indigo)">
        <Slot name="title">Socket.io</Slot>
        {riv.state.count}
      </Card>

      <CenteredColumn>
        <Form onSubmit={onSend}>
          <Slot name="title">Form</Slot>
          <Slot name="description">Test Form</Slot>

          <FormInputText required joinable placeholder="Info.getVersion" value={api} onUpdate={setApi}>
            <Slot name="label">API</Slot>
            <Slot name="description">The API method to call on the server</Slot>
            Content in default slot
          </FormInputText>

          <FormItem joinable>
            <Slot name="label">Generic</Slot>
            <Slot name="input">
              <Button onClick={onToggle}>test</Button>
            </Slot>
            <Slot name="description">This is a description for a FormItem</Slot>
          </FormItem>

          <Slot name="buttons">
            <Button onClick={() => {}}>Send</Button>
          </Slot>

        </Form>
      </CenteredColumn>
    </Column>
  );
}

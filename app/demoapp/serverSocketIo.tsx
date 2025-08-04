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
import FormInputList from '~/components/forms/FormInputList';
import FormInputEditor from '~/components/forms/FormInputEditor';


// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Server | Socket.io" },
    { name: "description", content: "Demo of Socket.io Transport" },
  ];
}

export default function Component() {
  const riv = useRiv();

  const [api, setApi] = React.useState<string>('');
  const [arg, setArg] = React.useState<string>('');
  // send
  const onSend = (e: React.FormEvent<HTMLFormElement>) => {
    // try to parse as JSON
    let sarg = arg;
    try {
      sarg = JSON.parse(arg);
    } catch (e) {}
    riv.apiCall(api, sarg).then((d) => {
      console.log('date', d)
    });
  };

  const onToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const testLogin = () => {
    riv.apiCall('Auth.login', {
      username: 'admin',
      password: 'admin',
    }).then((data) => {
      console.log('login data', data);
      riv.dispatch({ type: 'login', data });
    });
  }
  
  console.log(riv.getters.isLoggedIn());

  return (
    <Column>
      <Card color="var(--riv-indigo)">
        <Slot name="title">Socket.io</Slot>
        { riv.getters.isLoggedIn() ? 'Logged in' : 'Not logged in' }
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

          <FormInputEditor joinable value={arg} onUpdate={(value) => setArg(value)}>
            <Slot name="label">Argument</Slot>
            <Slot name="description">Provide an argument in JSON format</Slot>
          </FormInputEditor>

          <FormItem joinable>
            <Slot name="label">Generic</Slot>
            <Slot name="input">
              <Button onClick={testLogin}>test</Button>
            </Slot>
            <Slot name="description">This is a description for a FormItem</Slot>
          </FormItem>

          <Slot name="buttons">
            <Button onClick={() => {}}>Send</Button>
            <Button variant="outline" color="red" onClick={() => { setApi(''); setArg(''); }}>
              Clear
            </Button>
          </Slot>

        </Form>
      </CenteredColumn>
    </Column>
  );
}

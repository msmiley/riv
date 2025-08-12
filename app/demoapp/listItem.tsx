import React, { useState } from 'react';
import ListItem from '../components/lists/ListItem';
import Slot from '../components/slots/Slot';
import Icon from '../components/icons/Icon';
import Button from '../components/buttons/Button';
import Card from '../components/containers/Card';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';
import CenteredColumn from '~/components/layouts/CenteredColumn';

export function meta() {
  return [
    { title: 'ListItem Demo' },
    { name: 'description', content: 'Demonstrates the ListItem component with slots.' },
  ];
}

export default function ListItemDemo() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleListItemClick = (itemId: string) => {
    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };

  const handleButtonClick = (action: string) => {
    alert(`Button action: ${action}`);
  };

  return (
    <Column gap="2em">
      <Card>
        <h2>ListItem Component Demo</h2>
        <p>Demonstrates icon, title, subtitle, description, and button slots with selection tracking.</p>
      </Card>
      <CenteredColumn>
        <Card border>
          <ListItem 
            hoverable 
            selected={selectedItem === 'jane-doe'}
            onClick={() => handleListItemClick('jane-doe')}>
            <Slot name="icon"><Icon name="user" scale={1.5}/></Slot>
            <Slot name="title">Jane Doe</Slot>
            <Slot name="subtitle">Administrator</Slot>
            <Slot name="description">Active since 2022</Slot>
            <Slot name="buttons">
              <Button variant="icon" color="primary" onClick={() => handleButtonClick('edit user')}>
                <Icon name="edit"/>
              </Button>
              <Button variant="icon" color="primary" onClick={() => handleButtonClick('delete user')}>
                <Icon name="trash"/>
              </Button>
            </Slot>
          </ListItem>
          <ListItem 
            hoverable 
            selected={selectedItem === 'night-mode'}
            onClick={() => handleListItemClick('night-mode')}>
            <Slot name="icon"><Icon name="moon" scale={1.5} /></Slot>
            <Slot name="title">Night Mode</Slot>
            <Slot name="subtitle">Theme</Slot>
            <Slot name="description">Switch to dark theme</Slot>
            <Slot name="buttons"><Button color="secondary" onClick={() => handleButtonClick('toggle theme')}>Toggle</Button></Slot>
          </ListItem>
          <ListItem 
            hoverable 
            selected={selectedItem === 'draft'}
            onClick={() => handleListItemClick('draft')}>
            <Slot name="icon"><Icon name="save" scale={1.5} /></Slot>
            <Slot name="title">Draft</Slot>
            <Slot name="description">Last saved 2 hours ago</Slot>
          </ListItem>
          <ListItem 
            selected={selectedItem === 'minimal'}
            onClick={() => handleListItemClick('minimal')}>
            <Slot name="title">No Icon or Button</Slot>
            <Slot name="subtitle">Minimal</Slot>
          </ListItem>
        </Card>
      </CenteredColumn>
    </Column>
  );
}

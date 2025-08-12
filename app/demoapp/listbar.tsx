import React, { useState } from 'react';
import Listbar from '../components/lists/Listbar';
import ListItem from '../components/lists/ListItem';
import Slot from '../components/slots/Slot';
import Icon from '../components/icons/Icon';
import Button from '../components/buttons/Button';
import Card from '../components/containers/Card';
import Column from '../components/containers/Column';
import Row from '../components/containers/Row';

export function meta() {
  return [
    { title: 'Listbar Demo' },
    { name: 'description', content: 'Demonstrates the Listbar component with slots and search.' },
  ];
}

export default function ListbarDemo() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Sample data
  const users = [
    { id: '1', name: 'Alice Johnson', role: 'Administrator', status: 'Active' },
    { id: '2', name: 'Bob Smith', role: 'Developer', status: 'Active' },
    { id: '3', name: 'Carol Davis', role: 'Designer', status: 'Inactive' },
    { id: '4', name: 'David Wilson', role: 'Manager', status: 'Active' },
    { id: '5', name: 'Eve Brown', role: 'Developer', status: 'Active' },
  ];

  const handleUserClick = (userId: string) => {
    setSelectedUser(selectedUser === userId ? null : userId);
  };

  const handleAddUser = () => {
    alert('Add new user clicked');
  };

  const handleRefresh = () => {
    alert('Refresh users clicked');
  };

  return (
    <Row grow>
      <Listbar items={users}
               collapsed={collapsed}
               onCollapsedChange={setCollapsed}
               searchPlaceholder="Search users...">
        <Slot name="title">User Management</Slot>
        <Slot name="subtitle">Team Members</Slot>
        <Slot name="description">Manage and organize your team members</Slot>
        <Slot name="toolbar">
          <Button variant="icon" color="primary" onClick={handleAddUser}>
            <Icon name="plus" />
          </Button>
          <Button variant="icon" color="secondary" onClick={handleRefresh}>
            <Icon name="refresh" />
          </Button>
        </Slot>

        <Slot name="item">
          {({ item, index }: { item: any; index: number }) => (
            <ListItem
              key={item.id}
              hoverable
              selected={selectedUser === item.id}
              onClick={() => handleUserClick(item.id)}>
              <Slot name="icon">
                <Icon name="user" scale={1.2} />
              </Slot>
              <Slot name="title">{item.name}</Slot>
              <Slot name="subtitle">{item.role}</Slot>
              <Slot name="description">Status: {item.status}</Slot>
              <Slot name="buttons">
                <Button variant="icon" color="primary" onClick={() => alert(`Edit ${item.name}`)}>
                  <Icon name="edit" />
                </Button>
              </Slot>
            </ListItem>
          )}
        </Slot>
      </Listbar>

      <div style={{ flex: 1, padding: '2em' }}>
        <Column gap="2em">
          <Card>
            <h2>Listbar Component Demo</h2>
            <p>
              The Listbar is a collapsible sidebar component with search functionality and customizable slots.
            </p>
            <ul>
              <li><strong>Collapsible:</strong> Click the arrow button to collapse/expand</li>
              <li><strong>Search:</strong> Filter items using the search input</li>
              <li><strong>Slots:</strong> Customizable title, subtitle, description, toolbar, and item template</li>
              <li><strong>Selection:</strong> Click on items to select them</li>
            </ul>
          </Card>

          {selectedUser && (
            <Card border>
              <h3>Selected User</h3>
              {(() => {
                const user = users.find(u => u.id === selectedUser);
                return user ? (
                  <div>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Status:</strong> {user.status}</p>
                  </div>
                ) : null;
              })()}
            </Card>
          )}

          <Card>
            <h3>Current State</h3>
            <p><strong>Collapsed:</strong> {collapsed ? 'Yes' : 'No'}</p>
            <p><strong>Total Users:</strong> {users.length}</p>
            <p><strong>Selected User ID:</strong> {selectedUser || 'None'}</p>
          </Card>
        </Column>
      </div>
    </Row>
  );
}

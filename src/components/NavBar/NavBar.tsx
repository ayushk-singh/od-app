'use client';

import { useState } from 'react';
import { IconArrowRight, IconEdit, IconFileSearch, IconPhoto } from '@tabler/icons-react';
import { AppShell, Avatar, Box, Burger, Button, Group, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const data = [
  { icon: IconEdit, label: 'Create Application' },
  { icon: IconFileSearch, label: 'Track Application' },
];

export function NavBar() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);

  const items = data.map((item, index) => (
    <NavLink
      href="#required-for-focus"
      key={item.label}
      active={index === active}
      label={item.label}
      leftSection={<item.icon size={16} stroke={1.5} />}
      onClick={() => setActive(index)}
      variant="filled"
    />
  ));

  return (
    <AppShell
      header={{ height: { base: 60, md: 70, lg: 80 } }}
      navbar={{
        width: { base: 200, md: 300, lg: 400 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />X
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Box w={220}>{items}</Box>
        <Button w={220} rightSection={<IconArrowRight size={14} />}>Log Out</Button>
      </AppShell.Navbar>
      <AppShell.Main>Main</AppShell.Main>
    </AppShell>
  );
}

'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { IconArrowRight, IconEdit, IconFileSearch, IconSettings, IconUserCheck } from '@tabler/icons-react';
import { AppShell, Box, Burger, Button, Group, Image, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { account } from '@/config/appwrite';
import hicasLogo from '../../../public/hicas_logo.jpg';
import OdForm from '../OdForm/OdForm';
import SearchApplication from '../SearchApplication.tsx/SearchApplication';
import TutorAction from '../TutorAction/TutorAction'; // Faculty actions
import HodAction from '../HodAction/HodAction'; // HOD actions
import classes from '@/components/NavBar/NavBar.module.css';

export function NavBar() {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState(0);
  const [userRole, setUserRole] = useState<'student' | 'faculty' | 'hod' | null>(null); // Add 'hod' role
  const router = useRouter();

  useEffect(() => {
    // Fetch the current user's session or profile to determine their labels
    const fetchUserLabels = async () => {
      try {
        const user = await account.get();
        const labels = user.labels || []; // Default to an empty array if labels don't exist
        if (labels.includes('student')) {
          setUserRole('student');
        } else if (labels.includes('faculty')) {
          setUserRole('faculty');
        } else if (labels.includes('hod')) {
          setUserRole('hod');
        } else {
          alert('Invalid role! Please contact support.');
          router.push('/login'); // Redirect to login if role is not valid
        }
      } catch (err: any) {
        console.log('Error fetching user labels:', err);
        router.push('/login'); // Redirect to login if session is invalid
      }
    };

    fetchUserLabels();
  }, [router]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      alert('LogOut successful!');
      router.push('/login');
    } catch (err: any) {
      console.log("Can't Log Out error: ", err);
    }
  };

  // Navigation items based on user role
  const studentNavItems = [
    { icon: IconEdit, label: 'Create Application', component: <OdForm /> },
    { icon: IconFileSearch, label: 'Search Application', component: <SearchApplication /> },
  ];

  const facultyNavItems = [
    { icon: IconSettings, label: 'Manage Applications', component: <TutorAction /> },
    { icon: IconFileSearch, label: 'Search Application', component: <SearchApplication /> },
  ];

  const hodNavItems = [
    { icon: IconUserCheck, label: 'Approve Applications', component: <HodAction /> },
    { icon: IconFileSearch, label: 'Search Application', component: <SearchApplication /> },
  ];

  const navItems = userRole === 'student' ? studentNavItems 
                  : userRole === 'faculty' ? facultyNavItems 
                  : hodNavItems;

  const items = navItems.map((item, index) => (
    <NavLink
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
          <Burger
            opened={opened}
            className="bg-amber-400"
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <Image
            className={classes.logo}
            h="auto"
            w="100%"
            fit="contain"
            component={NextImage}
            src={hicasLogo}
            alt="HICAS logo"
          />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar withBorder={true} p="md">
        <Box w={220}>{items}</Box>
        <Button w={220} mt="xl" onClick={handleLogout} rightSection={<IconArrowRight size={14} />}>
          Log Out
        </Button>
      </AppShell.Navbar>
      <AppShell.Main>{navItems[active]?.component}</AppShell.Main>
    </AppShell>
  );
}

'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { account } from '@/config/appwrite';
import { Loader } from '@mantine/core';


export const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent = (props: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      const checkSession = async () => {
        try {
          // Check if the user is logged in
          await account.get(); // This will throw an error if no user is logged in
          setIsLoggedIn(true);
        } catch (err) {
          console.log('User not logged in:', err);
          router.push('/login'); // Redirect to login if not logged in
        } finally {
          setLoading(false);
        }
      };

      checkSession();
    }, [router]);

    if (loading) {
      return <Loader color="blue" />; // Add a loading indicator
    }

    return isLoggedIn ? <WrappedComponent {...props} /> : null;
  };

  return AuthenticatedComponent;
};

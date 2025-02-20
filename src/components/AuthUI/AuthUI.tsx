"use client"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { account } from '@/config/appwrite';
import { Button, Paper, PasswordInput, TextInput, Title, Text } from '@mantine/core';
import classes from '@/components/AuthUI/AuthUI.module.css';

export function Authentication() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        router.push('/'); 
      } catch (err) {
        console.log('User not logged in:', err);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await account.createEmailPasswordSession(email, password);
      alert('Login successful!');
      router.push('/'); 
    } catch (err: any) {
      setError(err?.message || 'An error occurred while logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome to OMS!
        </Title>

        <TextInput
          label="Email address"
          placeholder="hello@hicas.ac.in"
          size="md"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && (
          <Text color="red" size="sm" mt="md">
            {error}
          </Text>
        )}

        <Button fullWidth mt="xl" size="md" loading={loading} onClick={handleLogin}>
          Login
        </Button>
      </Paper>
    </div>
  );
}

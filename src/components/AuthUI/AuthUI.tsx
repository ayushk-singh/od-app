'use client';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import { useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { account } from '@/config/appwrite';
import classes from '@/components/AuthUI/AuthUI.module.css';

export function Authentication() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // Get the useRouter hook for navigation

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Attempt to create an email session with Appwrite
      await account.createEmailPasswordSession(email, password);
      alert('Login successful!');
      router.push('/'); // Navigate to home page after successful login
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

        <Button
          fullWidth
          mt="xl"
          size="md"
          loading={loading}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </div>
  );
}

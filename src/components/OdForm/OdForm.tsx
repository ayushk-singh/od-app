'use client';

import { useState, useEffect } from 'react';
import { Fieldset, NativeSelect, Textarea, TextInput, Button, Loader } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { account, databases } from '@/config/appwrite'; 

function OdForm() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);

  // Initialize Mantine Form
  const form = useForm({
    initialValues: {
      name: '',
      registerNo: '',
      reason: '',
      date: new Date(), // Set today's date as the default
      department: '',
      tutor: '',
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      registerNo: (value) => (value ? null : 'Register No. is required'),
      reason: (value) => (value ? null : 'Reason is required'),
      date: (value) => (value ? null : 'Date is required'),
      department: (value) => (value ? null : 'Department is required'),
      tutor: (value) => (value ? null : 'Tutor is required'),
    },
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const session = await account.getSession('current'); // Check for active session
        if (session) {
          const user = await account.get(); // Fetch user details
          setUser(user); // Set user state
          form.setFieldValue('name', user.name);
          form.setFieldValue('registerNo', user.$id) 
        } else {
          console.error('No active session. User needs to log in.');
        }
      } catch (error: any) {
        console.error('Error fetching session or user:', error.message);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    }

    fetchUser();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Define database details
      const databaseId = '6793af7200183db0b780'; // Replace with your Appwrite Database ID
      const collectionId = '6793bb560032ac48fdd8'; // Replace with your `od` collection ID

      // Prepare data for submission
      const documentData = {
        name: values.name,
        registerNo: values.registerNo,
        reason: values.reason,
        date: values.date.toISOString(), // Convert date to ISO string
        department: values.department,
        tutor: values.tutor,
      };

      // Submit data to Appwrite
      const response = await databases.createDocument(databaseId, collectionId, 'unique()', documentData);
      console.log('Document created successfully:', response);
      alert('Your application has been submitted successfully!');
      form.reset(); // Reset form after submission
    } catch (error: any) {
      console.error('Error submitting application:', error.message);
      alert('Failed to submit your application. Please try again.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <h1>Welcome, {user?.name}!</h1>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Fieldset legend="Application for OD">
          <TextInput
            label="Your name"
            placeholder="Your name"
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Register No."
            placeholder="Register No."
            mt="md"
            {...form.getInputProps('registerNo')}
          />
          <Textarea
            label="Reason"
            description="Why you want OD"
            placeholder="Participating in event..."
            mt="md"
            {...form.getInputProps('reason')}
          />
          <DateInput
            valueFormat="YYYY-MM-DD"
            label="Date input"
            placeholder="Date input"
            mt="md"
            {...form.getInputProps('date')}
          />
          <NativeSelect
            label="Select Your Department"
            description="Select Your Department"
            data={['BBA', 'BCA', 'B.Com']}
            mt="md"
            {...form.getInputProps('department')}
          />
          <NativeSelect
            label="Select Your Tutor"
            description="Select Your Tutor"
            data={['A', 'B', 'C']}
            mt="md"
            {...form.getInputProps('tutor')}
          />
        </Fieldset>
        <Button type="submit" mt="lg">
          Submit Application
        </Button>
      </form>
    </>
  );
}

export default OdForm;

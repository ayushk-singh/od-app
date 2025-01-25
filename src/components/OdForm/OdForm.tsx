'use client';

import { useState, useEffect } from 'react';
import { Fieldset, NativeSelect, Textarea, TextInput, Button, Loader } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { account, databases } from '@/config/appwrite'; 
import { Query } from 'appwrite';
import env from '@/env';

function OdForm() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [tutors, setTutors] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      registerNo: '',
      reason: '',
      date: new Date(),
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

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const session = await account.getSession('current');
        if (session) {
          const user = await account.get();
          setUser(user);
          form.setFieldValue('name', user.name);
          form.setFieldValue('registerNo', user.$id);
        }

        // Fetch departments
        const deptResponse = await databases.listDocuments(
          env.appwriteDB.databaseId,
          env.appwriteDB.collectionIdDepartment
        );
        setDepartments(deptResponse.documents.map((doc) => doc.$id));
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fetch tutors based on selected department
  useEffect(() => {
    async function fetchTutors() {
      if (!selectedDepartment) return;

      try {
        const tutorResponse = await databases.listDocuments(
          env.appwriteDB.databaseId,
          env.appwriteDB.collectionIdTutor,
          [Query.equal('department', selectedDepartment)] // Filter by department
        );
        setTutors(tutorResponse.documents.map((doc) => doc.name));
      } catch (error: any) {
        console.error('Error fetching tutors:', error.message);
      }
    }

    fetchTutors();
  }, [selectedDepartment]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const databaseId = env.appwriteDB.databaseId;
      const collectionId = env.appwriteDB.collectionIdOD;

      const documentData = {
        name: values.name,
        registerNo: values.registerNo,
        reason: values.reason,
        date: values.date.toISOString(),
        department: values.department,
        tutor: values.tutor,
        status: 'pending'
      };

      const response = await databases.createDocument(databaseId, collectionId, 'unique()', documentData);
      console.log('Document created successfully:', response);
      alert('Your application has been submitted successfully!');
      form.reset();
      setSelectedDepartment(null); // Reset selected department
      setTutors([]); // Clear tutors list

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
            data={departments}
            mt="md"
            {...form.getInputProps('department')}
            onChange={(e) => {
              const value = e.currentTarget.value;
              setSelectedDepartment(value);
              form.setFieldValue('department', value);
            }}
          />
          <NativeSelect
            label="Select Your Tutor"
            description="Select Your Tutor"
            data={tutors}
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

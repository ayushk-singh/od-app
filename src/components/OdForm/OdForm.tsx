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
  const [faculty, setFaculty] = useState<{ name: string, email: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedFacultyEmail, setSelectedFacultyEmail] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      registerNo: '',
      reason: '',
      date: new Date(),
      department: '',
      faculty: '',
      facultyEmail: '', // Add facultyEmail in form state
    },
    validate: {
      reason: (value) => (value ? null : 'Reason is required'),
      date: (value) => (value ? null : 'Date is required'),
      department: (value) => (value ? null : 'Department is required'),
      faculty: (value) => (value ? null : 'Faculty is required'),
      facultyEmail: (value) => (value ? null : 'Faculty email is required'),
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

  // Fetch faculty based on selected department
  useEffect(() => {
    async function fetchFaculty() {
      if (!selectedDepartment) return;

      try {
        const facultyResponse = await databases.listDocuments(
          env.appwriteDB.databaseId,
          env.appwriteDB.collectionIdFaculty,
          [Query.equal('department', selectedDepartment)] // Filter by department
        );
        setFaculty(facultyResponse.documents.map((doc) => ({
          name: doc.name,
          email: doc.email, // Assuming faculty document has `email` field
        })));
      } catch (error: any) {
        console.error('Error fetching faculty:', error.message);
      }
    }

    fetchFaculty();
  }, [selectedDepartment]);

  // Update the email based on selected faculty
  const handleFacultyChange = (value: string) => {
    const selectedFaculty = faculty.find((f) => f.name === value);
    if (selectedFaculty) {
      setSelectedFacultyEmail(selectedFaculty.email);
      form.setFieldValue('facultyEmail', selectedFaculty.email);
    }
    form.setFieldValue('faculty', value);
  };

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
        faculty: values.faculty,
        facultyEmail: values.facultyEmail, // Add facultyEmail to the document data
        status: 'pending',
      };

      const response = await databases.createDocument(databaseId, collectionId, 'unique()', documentData);
      console.log('Document created successfully:', response);
      alert('Your application has been submitted successfully!');
      form.reset();
      setSelectedDepartment(null); // Reset selected department
      setFaculty([]); // Clear faculty list
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
          <TextInput label="Your name" placeholder="Your name" value={form.values.name} readOnly />
          <TextInput label="Register No." placeholder="Register No." mt="md" value={form.values.registerNo} readOnly />
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
            data={['Select Department', ...departments]}
            value={form.values.department || 'Select Department'}
            mt="md"
            onChange={(e) => {
              const value = e.currentTarget.value;
              setSelectedDepartment(value !== 'Select Department' ? value : null);
              form.setFieldValue('department', value !== 'Select Department' ? value : '');
            }}
          />
          <NativeSelect
            label="Select Your Faculty"
            description="Select Your Faculty"
            data={['Select Faculty', ...faculty.map((fac) => fac.name)]}
            value={form.values.faculty || 'Select Faculty'}
            mt="md"
            onChange={(e) => handleFacultyChange(e.currentTarget.value)}
          />
          <TextInput
            label="Faculty Email"
            placeholder="Faculty email"
            mt="md"
            value={selectedFacultyEmail || ''}
            readOnly
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

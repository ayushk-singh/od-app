import React, { useState } from 'react';
import { Button, TextInput, Text, Loader, Group } from '@mantine/core';
import { databases } from '@/config/appwrite';
import { Query } from 'appwrite';
import env from '@/env';

function SearchApplication() {
  const [registerNo, setRegisterNo] = useState('');
  const [statusData, setStatusData] = useState<any[]>([]); // Array of status data for multiple applications
  const [loading, setLoading] = useState(false);

  const handleTrackStatus = async () => {
    setLoading(true);
    try {
      // Define your database details
      const databaseId = env.appwriteDB.databaseId; 
      const collectionId = env.appwriteDB.collectionIdOD; 

      // Fetch the documents by Register No.
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.equal('registerNo', registerNo), // Now querying with 'registerNo'
      ]);

      // Check if any documents were found
      if (response.documents.length > 0) {
        setStatusData(response.documents); // Set all matching documents to the state
      } else {
        alert('No applications found for the given Register No.');
        setStatusData([]); // Reset if no applications are found
      }
    } catch (error: any) {
      console.error('Error fetching application status:', error.message);
      alert('Error fetching the application status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <TextInput
        label="Track OD Application"
        placeholder="Enter Your Register No."
        value={registerNo}
        onChange={(e) => setRegisterNo(e.target.value)}
      />
      <Button mt="lg" variant="filled" onClick={handleTrackStatus}>Track Status</Button>

      {statusData.length > 0 ? (
        statusData.map((data, index) => (
          <Group display="flex" mt="xl" key={index}>
            <Text><strong>Register No.:</strong> {data.registerNo}</Text>
            <Text><strong>Name:</strong> {data.name}</Text>
            <Text><strong>Reason:</strong> {data.reason}</Text>
            <Text><strong>Date:</strong> {new Date(data.date).toLocaleDateString()}</Text>
            <Text><strong>Department:</strong> {data.department}</Text>
            <Text><strong>Tutor:</strong> {data.tutor}</Text>
            <Text><strong>Status:</strong> {data.status}</Text>
          </Group>
        ))
      ) : (
        <Text mt="xl" color="dimmed">Enter a register number to track the status.</Text>
      )}
    </>
  );
}

export default SearchApplication;

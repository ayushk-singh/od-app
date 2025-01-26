import React, { useState } from 'react';
import { Button, TextInput, Text, Loader, Table,ScrollArea } from '@mantine/core';
import { databases } from '@/config/appwrite';
import { Query } from 'appwrite';
import env from '@/env';
import cx from 'clsx';
import classes from './SearchApplication.module.css';


function SearchApplication() {
  const [registerNo, setRegisterNo] = useState('');
  const [statusData, setStatusData] = useState<any[]>([]); // Array of status data for multiple applications
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);


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

  const rows = statusData.map((row) => (
    <Table.Tr key={row.name}>
      <Table.Td>{row.$id}</Table.Td>
      <Table.Td>{row.name}</Table.Td>
      <Table.Td>{row.registerNo}</Table.Td>
      <Table.Td>{row.reason}</Table.Td>
      <Table.Td>{new Date(row.date).toLocaleDateString('en-GB')}</Table.Td>
      <Table.Td>{row.department}</Table.Td>
      <Table.Td>{row.faculty}</Table.Td>
      <Table.Td>{row.status}</Table.Td>
    </Table.Tr>
  ));


  return (
    <>
      <TextInput
        label="Track OD Application"
        placeholder="Enter Your Register No."
        value={registerNo}
        onChange={(e) => setRegisterNo(e.target.value)}
        mb="lg"
      />
      <Button variant="filled" onClick={handleTrackStatus}>Track Status</Button>

      {statusData.length > 0 ? (
        <ScrollArea h={300} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
        <Table miw={700}>
          <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <Table.Tr>
              <Table.Th>OD ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Register No</Table.Th>
              <Table.Th>Reason</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Faculty</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
      ) : (
        <Text mt="xl" color="dimmed">Enter a register number to track the status.</Text>
      )}
    </>
  );
}

export default SearchApplication;

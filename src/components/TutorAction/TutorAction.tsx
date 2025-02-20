'use client'

import { useState, useEffect } from 'react';
import { Button, Group, Table, ScrollArea, Text, Notification } from '@mantine/core';
import { databases } from '@/config/appwrite';
import env from '@/env';
import { account } from '@/config/appwrite';

interface RowData {
  id: string;
  name: string;
  registerNo: string;
  department: string;
  faculty: string;
  reason: string;
  date: string;
  status: string;
  facultyEmail: string;
}

export default function TutorAction() {
  const [data, setData] = useState<RowData[]>([]);
  const [pendingData, setPendingData] = useState<RowData[]>([]);
  const [approvedData, setApprovedData] = useState<RowData[]>([]);
  const [rejectedData, setRejectedData] = useState<RowData[]>([]);
  const [forwardedData, setForwardedData] = useState<RowData[]>([]);
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const session = await account.getSession('current');
        if (session) {
          const user = await account.get();
          setUser(user);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const response = await databases.listDocuments(
          env.appwriteDB.databaseId, 
          env.appwriteDB.collectionIdOD 
        );
        
        // Filter applications based on faculty email and include all relevant statuses
        const odApplications = response.documents
          .filter((doc: any) => 
            doc.facultyEmail === user.email && 
            (doc.status === 'pending' || 
             doc.status === 'approved_by_tutor' || 
             doc.status === 'rejected_by_tutor' || 
             doc.status === 'forwarded_to_hod')
          )
          .map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            registerNo: doc.registerNo, 
            reason: doc.reason,
            date: doc.date,
            department: doc.department,
            faculty: doc.faculty,
            status: doc.status,
            facultyEmail: doc.facultyEmail,
          }));

        setData(odApplications);

        // Update all status arrays
        setPendingData(odApplications.filter((doc) => doc.status === 'pending'));
        setApprovedData(odApplications.filter((doc) => doc.status === 'approved_by_tutor'));
        setRejectedData(odApplications.filter((doc) => doc.status === 'rejected_by_tutor'));
        setForwardedData(odApplications.filter((doc) => doc.status === 'forwarded_to_hod'));

      } catch (error: any) {
        console.error('Error fetching OD applications:', error.message);
      }
    }

    fetchData();
  }, [user]);

  const handleAction = async (action: string, id: string) => {
    let status: string;
    switch (action) {
      case 'approve':
        status = 'approved_by_tutor';
        break;
      case 'reject':
        status = 'rejected_by_tutor';
        break;
      case 'forward':
        status = 'forwarded_to_hod';
        break;
      default:
        return;
    }
  
    try {
      await databases.updateDocument(
        env.appwriteDB.databaseId,
        env.appwriteDB.collectionIdOD,
        id,
        { status }
      );
  
      // Find the row being updated
      const updatedRow = pendingData.find((row) => row.id === id);
  
      if (updatedRow) {
        const updatedRowWithStatus = { ...updatedRow, status };
  
        // Remove from pending
        setPendingData((prev) => prev.filter((row) => row.id !== id));
  
        // Add to appropriate status array
        switch (action) {
          case 'approve':
            setApprovedData((prev) => [...prev, updatedRowWithStatus]);
            break;
          case 'reject':
            setRejectedData((prev) => [...prev, updatedRowWithStatus]);
            break;
          case 'forward':
            setForwardedData((prev) => [...prev, updatedRowWithStatus]);
            break;
        }
  
        // Update main data array
        setData((prev) =>
          prev.map((row) => (row.id === id ? updatedRowWithStatus : row))
        );
  
        setNotification(`OD request ${status.replace(/_/g, ' ')} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating status:', error.message);
    }
  };

  const renderTable = (data: RowData[], status: string) => (
    <Table withTableBorder withColumnBorders verticalSpacing="xs" miw={700}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>OD Id</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Register No</Table.Th>
          <Table.Th>Department</Table.Th>
          <Table.Th>Faculty</Table.Th>
          <Table.Th>Reason</Table.Th>
          <Table.Th>Date</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <Table.Tr key={row.id}>
              <Table.Td>{row.id}</Table.Td>
              <Table.Td>{row.name}</Table.Td>
              <Table.Td>{row.registerNo}</Table.Td>
              <Table.Td>{row.department}</Table.Td>
              <Table.Td>{row.faculty}</Table.Td>
              <Table.Td>{row.reason}</Table.Td>
              <Table.Td>{new Date(row.date).toLocaleDateString('en-GB')}</Table.Td>
              <Table.Td>{row.status.replace(/_/g, ' ')}</Table.Td>
              <Table.Td>
                <Group>
                  {row.status === 'pending' && (
                    <>
                      <Button
                        color="green"
                        onClick={() => handleAction('approve', row.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        color="red"
                        onClick={() => handleAction('reject', row.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        color="blue"
                        onClick={() => handleAction('forward', row.id)}
                      >
                        Forward to HOD
                      </Button>
                    </>
                  )}
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={9}>
              <Text fw={500} ta="center">
                Nothing found for {status.replace(/_/g, ' ')}
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );

  return (
    <>
      <h1>Welcome, {user?.name}!</h1>

      {notification && (
        <Notification
          title="Action Successful"
          color="teal"
          onClose={() => setNotification(null)}
        >
          {notification}
        </Notification>
      )}

      <h2>Pending OD Requests</h2>
      <ScrollArea>{renderTable(pendingData, 'pending')}</ScrollArea>

      <h2>Approved OD Requests</h2>
      <ScrollArea>{renderTable(approvedData, 'approved_by_tutor')}</ScrollArea>

      <h2>Rejected OD Requests</h2>
      <ScrollArea>{renderTable(rejectedData, 'rejected_by_tutor')}</ScrollArea>

      <h2>Forwarded to HOD OD Requests</h2>
      <ScrollArea>{renderTable(forwardedData, 'forwarded_to_hod')}</ScrollArea>
    </>
  );
}
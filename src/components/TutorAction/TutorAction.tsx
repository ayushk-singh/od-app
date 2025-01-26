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
  facultyEmail: string; // Add facultyEmail to the RowData interface
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

  // Fetch OD applications from the database and filter by faculty email
  useEffect(() => {
    async function fetchData() {
      if (!user) return; // Ensure user is loaded before fetching data

      try {
        const response = await databases.listDocuments(
          env.appwriteDB.databaseId, 
          env.appwriteDB.collectionIdOD 
        );
        
        // Filter applications based on the logged-in user's email matching facultyEmail
        const odApplications = response.documents.filter((doc: any) => doc.facultyEmail === user.email)
          .map((doc: any) => ({
            id: doc.$id,
            name: doc.name,
            registerNo: doc.registerNo, 
            reason: doc.reason,
            date: doc.date,
            department: doc.department,
            faculty: doc.faculty,
            status: doc.status,
            facultyEmail: doc.facultyEmail, // Add facultyEmail to each document
          }));

        setData(odApplications);

        // Separate applications based on status
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

  // Update the status of the OD request based on action
  const updateStatus = async (id: string, status: string) => {
    try {
      await databases.updateDocument(
        env.appwriteDB.databaseId,
        env.appwriteDB.collectionIdOD,
        id,
        { status } // Update the status based on the passed value
      );
      setNotification(`OD request updated to ${status.replace(/_/g, ' ')}`);
      // Re-fetch data after action
      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error.message);
    }
  };

  const handleAction = (action: string, id: string) => {
    // Implement action logic based on action type
    switch (action) {
      case 'approve':
        updateStatus(id, 'approved_by_tutor'); // Change status to approved_by_tutor
        break;
      case 'reject':
        updateStatus(id, 'rejected_by_tutor'); // Change status to rejected_by_tutor
        break;
      case 'forward':
        updateStatus(id, 'forwarded_to_hod'); // Change status to forwarded_to_hod
        break;
      default:
        break;
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
              <Table.Td>{row.status}</Table.Td>
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
                Nothing found for {status}
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

      {/* Notification */}
      {notification && (
        <Notification
          title="Action Successful"
          color="teal"
          onClose={() => setNotification(null)}
        >
          {notification}
        </Notification>
      )}

      {/* Table for Pending OD requests */}
      <h2>Pending OD Requests</h2>
      <ScrollArea>{renderTable(pendingData, 'pending')}</ScrollArea>

      {/* Table for Approved OD requests */}
      <h2>Approved OD Requests</h2>
      <ScrollArea>{renderTable(approvedData, 'approved_by_tutor')}</ScrollArea>

      {/* Table for Rejected OD requests */}
      <h2>Rejected OD Requests</h2>
      <ScrollArea>{renderTable(rejectedData, 'rejected_by_tutor')}</ScrollArea>

      {/* Table for Forwarded to HOD OD requests */}
      <h2>Forwarded to HOD OD Requests</h2>
      <ScrollArea>{renderTable(forwardedData, 'forwarded_to_hod')}</ScrollArea>
    </>
  );
}

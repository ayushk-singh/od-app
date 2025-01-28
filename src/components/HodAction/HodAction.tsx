'use client'

import { useState, useEffect } from 'react';
import { Button, Group, Table, ScrollArea, Text, Notification } from '@mantine/core';
import { databases } from '@/config/appwrite';
import env from '@/env';
import { account } from '@/config/appwrite';
import { Query } from 'appwrite';

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

interface HodData {
  id: string;
  name: string;
  email: string;
  department: string;
}

export default function HodAction() {
  const [data, setData] = useState<RowData[]>([]);
  const [approvedData, setApprovedData] = useState<RowData[]>([]);
  const [rejectedData, setRejectedData] = useState<RowData[]>([]);
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [hodDepartment, setHodDepartment] = useState<string | null>(null);

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

  // Fetch HOD's department based on their email
  useEffect(() => {
    async function fetchHodDepartment() {
      if (!user) return;

      try {
        const hodData = await databases.listDocuments(
          env.appwriteDB.databaseId,
          env.appwriteDB.collectionIdHod,
          [
            Query.equal('email', user.email)
          ]
        );

        if (hodData.documents.length > 0) {
          setHodDepartment(hodData.documents[0].department);
        } else {
          console.error('HOD not found or no department assigned');
        }
      } catch (error: any) {
        console.error('Error fetching HOD department:', error.message);
      }
    }

    fetchHodDepartment();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !hodDepartment) return;

      try {
        const response = await databases.listDocuments(
          env.appwriteDB.databaseId,
          env.appwriteDB.collectionIdOD
        );

        // Filter OD applications based on HOD's department and status
        const odApplications = response.documents
          .filter((doc: any) =>
            doc.status === 'forwarded_to_hod' &&
            doc.department === hodDepartment
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
        setApprovedData(odApplications.filter((doc) => doc.status === 'approved_by_hod'));
        setRejectedData(odApplications.filter((doc) => doc.status === 'rejected_by_hod'));
      } catch (error: any) {
        console.error('Error fetching OD applications:', error.message);
      }
    }

    fetchData();
  }, [user, hodDepartment]);

  const handleAction = async (action: string, id: string) => {
    let status: string;
    switch (action) {
      case 'approve':
        status = 'approved_by_hod';
        break;
      case 'reject':
        status = 'rejected_by_hod';
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

      const updatedRow = data.find((row) => row.id === id);
      if (updatedRow) {
        const updatedRowWithStatus = { ...updatedRow, status };

        setData((prev) => prev.filter((row) => row.id !== id));

        switch (action) {
          case 'approve':
            setApprovedData((prev) => [...prev, updatedRowWithStatus]);
            break;
          case 'reject':
            setRejectedData((prev) => [...prev, updatedRowWithStatus]);
            break;
        }

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
                  {row.status === 'forwarded_to_hod' && (
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

      <h2>OD Requests Forwarded to HOD</h2>
      <ScrollArea>{renderTable(data, 'forwarded_to_hod')}</ScrollArea>

      <h2>Approved OD Requests</h2>
      <ScrollArea>{renderTable(approvedData, 'approved_by_hod')}</ScrollArea>

      <h2>Rejected OD Requests</h2>
      <ScrollArea>{renderTable(rejectedData, 'rejected_by_hod')}</ScrollArea>
    </>
  );
}

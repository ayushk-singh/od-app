import { Client, Account } from 'appwrite';
import env from '@/env';


export const client = new Client();

client
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId); 

export const account = new Account(client);
export { ID } from 'appwrite';

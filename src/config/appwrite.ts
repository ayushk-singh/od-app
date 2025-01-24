import { Client, Account, Databases } from 'appwrite';
import env from '@/env';


export const client = new Client();

client
    .setEndpoint(env.appwrite.endpoint)
    .setProject(env.appwrite.projectId); 

export const account = new Account(client);
export const databases = new Databases(client); 
export { ID } from 'appwrite';

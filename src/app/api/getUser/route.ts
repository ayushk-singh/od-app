// app/api/getUser/route.js
import { account } from '@/config/appwrite'; 

export async function GET() {
  try {
    const user = await account.get();
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(JSON.stringify({ message: 'Failed to fetch user details', error }), { status: 500 });
  }
}

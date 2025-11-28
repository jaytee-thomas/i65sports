import { currentUser } from '@clerk/nextjs/server';

export default async function TestClerkPage() {
  const user = await currentUser();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Clerk Backend Test</h1>
      {user ? (
        <div>
          <p>✅ Clerk is working!</p>
          <p>User ID: {user.id}</p>
          <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
          <p>Username: {user.username}</p>
        </div>
      ) : (
        <div>
          <p>❌ No user logged in</p>
          <p>Clerk is installed but you need to sign in</p>
        </div>
      )}
    </div>
  );
}


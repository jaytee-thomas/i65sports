import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ CLERK_WEBHOOK_SECRET not set - webhook will not verify signatures');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  if (WEBHOOK_SECRET) {
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('❌ Error verifying webhook:', err);
      return new Response('Error: Verification failed', { status: 400 });
    }
  } else {
    evt = JSON.parse(body);
  }

  const eventType = evt.type;
  console.log('📨 Clerk webhook event:', eventType);

  if (eventType === 'user.created') {
    const { id, email_addresses, username, first_name, last_name } = evt.data;

    try {
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username || email_addresses[0].email_address.split('@')[0],
          role: 'USER',
        },
      });

      console.log('✅ User synced to database:', user.id, user.username);
      return new Response(JSON.stringify({ success: true, userId: user.id }), { status: 200 });
    } catch (error) {
      console.error('❌ Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, username } = evt.data;

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0].email_address,
          username: username || undefined,
        },
      });

      console.log('✅ User updated in database:', id);
    } catch (error) {
      console.error('❌ Error updating user:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log('✅ User deleted from database:', id);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
    }
  }

  return new Response('Webhook processed', { status: 200 });
}


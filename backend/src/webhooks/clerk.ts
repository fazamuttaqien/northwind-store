import type { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import { getEnv } from '../lib/env';
import { parseRole } from '../lib/roles';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function clerkWebhookHandler(req: Request, res: Response) {
  const env = getEnv();

  try {
    if (!env.CLERK_WEBHOOK_SECRET) {
      res.status(503).send('Webhooks secret is not provided');
      return;
    }

    console.log({
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
      contentType: req.headers['content-type'],
    });

    const evt = await verifyWebhook(req, {
      signingSecret: env.CLERK_WEBHOOK_SECRET,
    });

    console.log('Clerk webhook:', evt.type);

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ??
        u.email_addresses?.[0]?.email_address ??
        null;

      const displayName =
        [u.first_name, u.last_name].filter(Boolean).join(' ') ||
        u.username ||
        null;

      const role = parseRole(u.public_metadata?.role);

      await db
        .insert(users)
        .values({
          clerkUserId: u.id,
          email,
          displayName,
          role,
        })
        .onConflictDoUpdate({
          target: users.clerkUserId,
          set: {
            email,
            displayName,
            role,
            updatedAt: new Date(),
          },
        });
    }

    if (evt.type === 'user.deleted') {
      const id = evt.data.id;

      if (id) {
        await db.delete(users).where(eq(users.clerkUserId, id));
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Clerk webhook error:', err);

    return res.status(400).json({
      error: 'Invalid webhook',
    });
  }
}

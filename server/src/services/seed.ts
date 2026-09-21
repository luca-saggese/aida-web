import {
  UserModel,
  OrganizationModel,
  MembershipModel,
  hashPassword,
} from '../models/index.js';
import { env } from '../config/env.js';

const DEV_USER_EMAIL = process.env.SEED_USER_EMAIL ?? 'dev@gotraxx-clone.local';
const DEV_USER_NAME = process.env.SEED_USER_NAME ?? 'Bernardo Mascellani';
const DEV_USER_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'DevPass123!';
const DEV_ORG_NAME = process.env.SEED_ORG_NAME ?? "Bernardo's org";

/**
 * Development seed. If a user with the dev email already exists this is a no-op
 * to keep repeated dev runs idempotent. In test mode seeding is handled by the
 * test harness instead.
 */
export async function seedDevelopment(): Promise<void> {
  if (env.NODE_ENV === 'test') return;

  const existing = await UserModel.findOne({ email: DEV_USER_EMAIL });
  if (existing) return;

  const user = await UserModel.create({
    name: DEV_USER_NAME,
    email: DEV_USER_EMAIL,
    passwordHash: await hashPassword(DEV_USER_PASSWORD),
    emailVerified: true,
    emailVerifiedAt: new Date(),
  });

  let org = await OrganizationModel.findOne({ name: DEV_ORG_NAME });
  if (!org) {
    org = await OrganizationModel.create({ name: DEV_ORG_NAME, slug: 'bernardos-org' });
  }

  await MembershipModel.create({
    organizationId: org._id,
    userId: user._id,
    role: 'owner',
  });

  // eslint-disable-next-line no-console
  console.log(`[seed] Created dev user ${DEV_USER_EMAIL} (${DEV_USER_NAME}) in ${DEV_ORG_NAME}`);
}

/** Return the primary dev org, creating it if needed. */
export async function getDevOrganization() {
  let org = await OrganizationModel.findOne({ name: DEV_ORG_NAME });
  if (!org) {
    org = await OrganizationModel.create({ name: DEV_ORG_NAME, slug: 'bernardos-org' });
  }
  return org;
}
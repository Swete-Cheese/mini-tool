import Dexie, { Table } from 'dexie';
import type { Party, Agreement } from '@/types';

class NdaDatabase extends Dexie {
  parties!: Table<Party, number>;
  agreements!: Table<Agreement, number>;

  constructor() {
    super('NdaMiniTool');
    this.version(1).stores({
      parties: '++id, name, type, updatedAt',
      agreements: '++id, projectName, status, updatedAt, createdAt',
    });
  }
}

export const db = new NdaDatabase();

// Party CRUD helpers
export async function getAllParties(): Promise<Party[]> {
  return db.parties.orderBy('updatedAt').reverse().toArray();
}

export async function searchParties(query: string): Promise<Party[]> {
  const q = query.toLowerCase();
  return db.parties
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q)
    )
    .toArray();
}

export async function saveParty(party: Party): Promise<number> {
  const now = new Date();
  if (party.id) {
    await db.parties.update(party.id, { ...party, updatedAt: now });
    return party.id;
  } else {
    return db.parties.add({ ...party, createdAt: now, updatedAt: now });
  }
}

export async function deleteParty(id: number): Promise<void> {
  return db.parties.delete(id);
}

// Agreement CRUD helpers
export async function getAllAgreements(): Promise<Agreement[]> {
  return db.agreements.orderBy('updatedAt').reverse().toArray();
}

export async function getAgreement(id: number): Promise<Agreement | undefined> {
  return db.agreements.get(id);
}

export async function saveAgreement(agreement: Agreement): Promise<number> {
  const now = new Date();
  if (agreement.id) {
    await db.agreements.update(agreement.id, { ...agreement, updatedAt: now });
    return agreement.id;
  } else {
    return db.agreements.add({ ...agreement, createdAt: now, updatedAt: now });
  }
}

export async function deleteAgreement(id: number): Promise<void> {
  return db.agreements.delete(id);
}

export async function getAgreementsByStatus(
  status: Agreement['status']
): Promise<Agreement[]> {
  return db.agreements
    .where('status')
    .equals(status)
    .reverse()
    .sortBy('updatedAt');
}

export async function searchAgreements(query: string): Promise<Agreement[]> {
  const q = query.toLowerCase();
  return db.agreements
    .filter(
      (a) =>
        a.projectName.toLowerCase().includes(q) ||
        a.partyA?.name.toLowerCase().includes(q) ||
        (a.partyB?.name || '').toLowerCase().includes(q)
    )
    .toArray();
}

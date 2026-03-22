import fs from 'fs';
import path from 'path';
import type {
  RetroEvent,
  Person,
  Organization,
  Model,
  Paper,
  Concept,
  Cycle,
  Epoch,
  GraphData,
  AnyEntity,
} from './types';

const ROOT = path.join(process.cwd(), '..');

function readJsonFile(filePath: string): any {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readJsonDir(dir: string): any[] {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJsonFile(path.join(fullPath, f)))
    .filter(Boolean);
}

export function getAllEvents(): RetroEvent[] {
  return readJsonDir('events');
}

export function getAllPeople(): Person[] {
  return readJsonDir('entities/people');
}

export function getAllOrgs(): Organization[] {
  return readJsonDir('entities/organizations');
}

export function getAllModels(): Model[] {
  return readJsonDir('entities/models');
}

export function getAllPapers(): Paper[] {
  return readJsonDir('papers');
}

export function getAllConcepts(): Concept[] {
  return readJsonDir('concepts');
}

export function getAllCycles(): Cycle[] {
  return readJsonDir('cycles');
}

export function getAllEpochs(): Epoch[] {
  const epochsDir = path.join(ROOT, 'epochs');
  if (!fs.existsSync(epochsDir)) return [];
  return fs
    .readdirSync(epochsDir)
    .filter((d) => {
      const stat = fs.statSync(path.join(epochsDir, d));
      return stat.isDirectory();
    })
    .map((d) => readJsonFile(path.join(epochsDir, d, 'epoch.json')))
    .filter(Boolean)
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
}

export function getAllGraphs(): GraphData[] {
  return readJsonDir('graphs');
}

export function getEntityById(id: string): AnyEntity | null {
  const all = getAllEntities();
  return all.find((e) => e.id === id) ?? null;
}

export function getAllEntities(): AnyEntity[] {
  return [
    ...getAllEvents(),
    ...getAllPeople(),
    ...getAllOrgs(),
    ...getAllModels(),
    ...getAllPapers(),
    ...getAllConcepts(),
    ...getAllCycles(),
  ];
}

export function getEntitiesByIds(ids: string[]): AnyEntity[] {
  const idSet = new Set(ids);
  return getAllEntities().filter((e) => idSet.has(e.id));
}

import {
  getAllEvents,
  getAllPeople,
  getAllOrgs,
  getAllModels,
  getAllEpochs,
  getAllCycles,
  getAllPapers,
  getAllConcepts,
  getAllEntities,
  getAllGraphs,
} from '@/lib/data';
import { getAllLocations } from '@/lib/locations';
import Hero from '@/components/Hero';
import MapExplorer from '@/components/MapExplorer';

export default function Home() {
  const events = getAllEvents();
  const people = getAllPeople();
  const orgs = getAllOrgs();
  const models = getAllModels();
  const epochs = getAllEpochs();
  const locations = getAllLocations();
  const allEntities = getAllEntities();
  const graphs = getAllGraphs();

  const graphEdgeCount = graphs.reduce(
    (sum: number, g: any) => sum + (g.edge_count ?? g.edges?.length ?? 0),
    0
  );

  const stats = {
    events: events.length,
    people: people.length,
    orgs: orgs.length,
    models: models.length,
    epochs: epochs.length,
    total: allEntities.length,
  };

  return (
    <main>
      <Hero stats={stats} />
      <MapExplorer
        locations={locations}
        epochs={epochs}
        entities={allEntities}
        graphEdgeCount={graphEdgeCount}
      />
    </main>
  );
}

import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { _id?: string; name: string; mascot?: string; members: string[] };
const loadTeams = async () => (await getJson<{ teams: Team[] }>('/api/teams')).teams;

export default function Teams() {
  return (
    <CapabilityCard
      title="Equipes"
      description="Conheça as equipes e veja quantas pessoas participam de cada uma."
      loadingText="Carregando equipes…"
      emptyText="Nenhuma equipe cadastrada."
      errorText="Não foi possível carregar as equipes."
      load={loadTeams}
      renderItem={({ name, mascot, members }) => (
        <><strong>{name}</strong>{mascot && <> — Mascote: {mascot}</>} — {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}</>
      )}
    />
  );
}

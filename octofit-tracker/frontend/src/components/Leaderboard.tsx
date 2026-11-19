import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Standing = { _id?: string; rank: number; teamName: string; totalPoints: number };
const loadLeaderboard = async () => (await getJson<{ leaderboard: Standing[] }>('/api/leaderboard')).leaderboard;

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Placar"
      description="Compare a pontuação total das equipes."
      loadingText="Carregando placar…"
      emptyText="Sem pontuação registrada."
      errorText="Não foi possível carregar o placar."
      load={loadLeaderboard}
      renderItem={({ rank, teamName, totalPoints }) => (
        <>{rank}º lugar — {teamName}: {totalPoints} {totalPoints === 1 ? 'ponto' : 'pontos'}</>
      )}
    />
  );
}

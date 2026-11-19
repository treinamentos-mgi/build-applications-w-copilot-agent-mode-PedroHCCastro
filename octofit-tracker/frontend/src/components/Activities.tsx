import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { _id?: string; type: string; minutes: number; points: number };
const loadActivities = async () => (await getJson<{ activities: Activity[] }>('/api/activities')).activities;

const activityLabels = new Map([
  ['run', 'Corrida'],
  ['walk', 'Caminhada'],
  ['cycle', 'Ciclismo'],
  ['strength', 'Treino de força'],
  ['mobility', 'Treino de mobilidade'],
]);

export default function Activities() {
  return (
    <CapabilityCard
      title="Atividades"
      description="Acompanhe os minutos de atividade e os pontos das pessoas participantes."
      loadingText="Carregando atividades…"
      emptyText="Nenhuma atividade registrada."
      errorText="Não foi possível carregar as atividades."
      load={loadActivities}
      renderItem={({ type, minutes, points }) => (
        <>{activityLabels.get(type) ?? 'Outra atividade'} — {minutes} {minutes === 1 ? 'minuto' : 'minutos'}, {points} {points === 1 ? 'ponto' : 'pontos'}</>
      )}
    />
  );
}

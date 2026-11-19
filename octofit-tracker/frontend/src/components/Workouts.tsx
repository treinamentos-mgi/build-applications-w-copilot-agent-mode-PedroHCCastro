import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { _id?: string; title: string; reason: string };
const demoUserEmail = 'mona@example.com';
const loadSuggestions = async () => (
  await getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(demoUserEmail)}`)
).suggestions;

export default function Workouts() {
  return (
    <CapabilityCard
      title="Sugestões de treino"
      description="Veja recomendações de treino para Mona, a pessoa usuária de demonstração."
      loadingText="Carregando sugestões de treino…"
      emptyText="Nenhuma sugestão de treino disponível."
      errorText="Não foi possível carregar as sugestões de treino."
      load={loadSuggestions}
      renderItem={({ title, reason }) => <><strong>{title}</strong> — {reason}</>}
    />
  );
}

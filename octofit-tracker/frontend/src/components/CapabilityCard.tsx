import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type ListState<T> = { status: 'loading' } | { status: 'error' } | { status: 'loaded'; items: T[] };

type Props<T> = {
  title: string;
  description: string;
  loadingText: string;
  emptyText: string;
  errorText: string;
  load: () => Promise<T[]>;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T extends { _id?: string }>({
  title, description, loadingText, emptyText, errorText, load, renderItem,
}: Props<T>) {
  const [state, setState] = useState<ListState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    load().then(
      (items) => { if (active) setState({ status: 'loaded', items }); },
      () => { if (active) setState({ status: 'error' }); },
    );
    return () => { active = false; };
  }, [load]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">{loadingText}</p>}
        {state.status === 'error' && <p role="alert">{errorText}</p>}
        {state.status === 'loaded' && (state.items.length === 0
          ? <p>{emptyText}</p>
          : <ul>{state.items.map((item, index) => <li key={item._id ?? index}>{renderItem(item)}</li>)}</ul>)}
      </div>
    </section>
  );
}

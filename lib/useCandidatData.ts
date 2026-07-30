'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { candidatAPI, CandidatMe, Convocation, EpreuvePlanning } from '@/lib/api';

export interface CandidatBundle {
  candidat: CandidatMe;
  convocation: Convocation | null;
  planning: EpreuvePlanning[];
}

function getApiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}

function unwrapApiData<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function useCandidatData() {
  const [data, setData] = useState<CandidatBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const meRes = await candidatAPI.me();
      const [convRes, planRes] = await Promise.allSettled([
        candidatAPI.convocation(),
        candidatAPI.planning(),
      ]);

      setData({
        candidat: unwrapApiData<CandidatMe>(meRes.data),
        convocation: convRes.status === 'fulfilled' ? unwrapApiData<Convocation>(convRes.value.data) : null,
        planning: planRes.status === 'fulfilled' ? unwrapApiData<EpreuvePlanning[]>(planRes.value.data) : [],
      });

      if (convRes.status === 'rejected') {
        setError(getApiMessage(convRes.reason, 'Convocation non disponible.'));
      }
    } catch (err) {
      setData(null);
      setError(getApiMessage(err, 'Impossible de charger les données candidat.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await load();
      if (cancelled) return;
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error, refetch: load };
}

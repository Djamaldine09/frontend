'use client';

import { useState, useEffect } from 'react';
import { Phone, Navigation, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCandidatData } from '@/lib/useCandidatData';
import { resolveSalle } from '@/lib/api';

const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-soft)', borderRadius: 16 }}>
      <div style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Chargement de la carte...</div>
        <div style={{ width: 40, height: 40, borderRadius: 50, border: '3px solid var(--ink-line)', borderTopColor: 'var(--ink)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  ),
});

export default function ItinerairePage() {
  const { data, loading } = useCandidatData();
  const [mapCoordinates, setMapCoordinates] = useState({ latitude: -18.8792, longitude: 47.5079 });
  const centre = data?.candidat?.centreAffecte;
  const centreAddress = centre ? [centre.adresse, centre.ville, centre.region].filter(Boolean).join(', ') : '';
  const centreLat = centre?.coords?.lat ?? centre?.latitude;
  const centreLng = centre?.coords?.lng ?? centre?.longitude;

  useEffect(() => {
    if (!centre) {
      setMapCoordinates({ latitude: -18.8792, longitude: 47.5079 });
      return;
    }

    // Priorité absolue : coordonnées GPS précises déjà enregistrées pour le centre.
    // On ne géolocalise l'adresse texte (Nominatim) qu'en dernier recours, car un
    // géocodage d'adresse peut retomber sur un point imprécis ou erroné.
    if (centreLat !== undefined && centreLng !== undefined) {
      setMapCoordinates({ latitude: centreLat, longitude: centreLng });
      return;
    }

    if (centreAddress) {
      const encodedAddress = encodeURIComponent(centreAddress);
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`)
        .then((res) => res.json())
        .then((locations) => {
          if (Array.isArray(locations) && locations.length > 0) {
            const location = locations[0];
            setMapCoordinates({ latitude: Number(location.lat), longitude: Number(location.lon) });
          } else {
            setMapCoordinates({ latitude: -18.8792, longitude: 47.5079 });
          }
        })
        .catch(() => {
          setMapCoordinates({ latitude: -18.8792, longitude: 47.5079 });
        });
      return;
    }

    setMapCoordinates({ latitude: -18.8792, longitude: 47.5079 });
  }, [centre, centreAddress, centreLat, centreLng]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="card" style={{ height: 60, background: 'var(--bg-soft)', borderRadius: 16 }} />
        <div className="card" style={{ height: 400, background: 'var(--bg-soft)', borderRadius: 16 }} />
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="card" style={{ padding: 28, borderRadius: 16, background: 'linear-gradient(135deg, rgba(232,82,82,0.08), rgba(232,82,82,0.02))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <AlertCircle size={24} style={{ color: 'var(--status-red)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>
              Centre d'examen non attribué
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Votre affectation est en cours de traitement. Revenez dans quelques heures pour voir l'itinéraire vers votre centre d'examen.
            </p>
            <Link href="/dashboard" style={{ color: 'var(--lime)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { candidat, convocation } = data!;
  const numeroPlace = centre.numeroPlace || convocation?.numeroPlace || '—';
  const salle = resolveSalle(centre.salle || convocation?.salle, numeroPlace);

  const handleOpenMaps = () => {
    // Priorité absolue aux coordonnées GPS précises : elles pointent exactement
    // sur le centre, contrairement à une adresse texte qui peut être mal
    // interprétée par le géocodeur de Google Maps.
    if (centreLat !== undefined && centreLng !== undefined) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${centreLat},${centreLng}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
      return;
    }

    if (centreAddress) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(centreAddress)}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Back link */}
      <Link href="/dashboard" style={{ color: 'var(--ink-soft)', textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
        <ArrowLeft size={16} /> Retour
      </Link>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)', marginBottom: 8 }}>
          Itinéraire vers mon centre d'examen
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>
          Informations et directions vers <strong>{centre.nom}</strong>
        </p>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'stretch' }}>
        {/* Map section */}
        <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', minHeight: 400 }}>
          <DynamicMap
            latitude={mapCoordinates.latitude}
            longitude={mapCoordinates.longitude}
            centerName={centre.nom}
            address={centreAddress}
            photo={centre.photo}
          />
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Centre info card */}
          <div className="card" style={{ padding: 18, borderRadius: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Centre d'examen
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 2, lineHeight: 1.3 }}>
              {centre.nom}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 12, lineHeight: 1.5 }}>
              {centre.adresse && <div>{centre.adresse}</div>}
              <div>{centre.ville || centre.region || '—'}</div>
            </div>

            {centre.telephone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>
                <Phone size={14} />
                <a href={`tel:${centre.telephone}`} style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>
                  {centre.telephone}
                </a>
              </div>
            )}

            {centre.email && (
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12 }}>
                <span style={{ display: 'block' }}>{centre.email}</span>
              </div>
            )}
          </div>

          {/* Salle & Place */}
          <div className="card" style={{ padding: 14, borderRadius: 16, background: 'var(--bg-soft)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Salle
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
                  {salle}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Place
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>
                  {numeroPlace}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleOpenMaps}
            className="btn-lime"
            style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <Navigation size={15} />
            Itinéraire Google Maps
          </button>
        </div>
      </div>

      {/* Instructions section */}
      <div className="card" style={{ padding: 22, borderRadius: 16, background: 'linear-gradient(135deg, rgba(205,245,100,0.06), rgba(205,245,100,0.02))' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: 'var(--lime)' }} />
          À savoir avant l'examen
        </h3>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            "Arrivez au moins 30 minutes avant le début de l'épreuve",
            "Apportez votre convocation et une pièce d'identité valide",
            "Munis-toi du matériel autorisé (stylo, crayon, calculatrice si permise)",
            "La localisation GPS du centre est disponible ci-contre",
            "En cas de problème d'accès, appelle immédiatement le centre",
          ].map((item, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 50, background: 'var(--lime)', color: 'var(--ink)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
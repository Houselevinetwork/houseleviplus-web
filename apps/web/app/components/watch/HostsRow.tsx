'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export interface Host {
  _id: string;
  name: string;
  avatarUrl?: string;
  slug?: string;
}

interface HostsRowProps {
  hosts: Host[];
}

const STORAGE_KEY = 'hl_followed_hosts';

function getFollowed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveFollowed(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

export function HostsRow({ hosts }: HostsRowProps) {
  const router   = useRouter();
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => { setFollowed(getFollowed()); }, []);

  const toggleFollow = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFollowed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFollowed(next);
      return next;
    });
    // TODO: sync to backend when auth is ready
    // POST /api/content/hosts/:id/follow  or  DELETE /api/content/hosts/:id/follow
  };

  if (!hosts.length) return null;

  return (
    <div className="watch-section">
      <div className="watch-section__header">
        <h2 className="watch-section__title">Browse by Host</h2>
      </div>
      <div className="hosts-row">
        {hosts.map(host => {
          const initials  = host.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
          const isFollowed = followed.has(host._id);

          return (
            <div
              key={host._id}
              className="host-item"
              onClick={() => router.push(`/hosts/${host.slug ?? host._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && router.push(`/hosts/${host.slug ?? host._id}`)}
            >
              <div className="host-avatar-wrap">
                {host.avatarUrl
                  ? <img src={host.avatarUrl} alt={host.name} className="host-avatar" />
                  : <div className="host-avatar-placeholder">{initials}</div>
                }
              </div>

              <span className="host-name">{host.name}</span>

              {/* Follow button */}
              <button
                className={`host-follow-btn${isFollowed ? ' host-follow-btn--following' : ''}`}
                onClick={e => toggleFollow(e, host._id)}
                aria-label={isFollowed ? `Unfollow ${host.name}` : `Follow ${host.name}`}
                title={isFollowed ? `Unfollow ${host.name}` : `Follow ${host.name}`}
              >
                {isFollowed ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Follow
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

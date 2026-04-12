'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

const emptyPlayer = {
  name: '', age: '', dateOfBirth: '', position: 'PG' as Position,
  teamId: '' as string, jerseyNumber: '', guardianName: '', guardianEmail: '', guardianPhone: '', notes: '',
};

export default function RosterPage() {
  const [showTeamForm,   setShowTeamForm]   = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [selectedTeam,   setSelectedTeam]   = useState<string>('all');
  const [editPlayer,     setEditPlayer]     = useState<string | null>(null);

  const [teamForm, setTeamForm] = useState({ name: '', ageGroup: '', season: '2025-2026' });
  const [playerForm, setPlayerForm] = useState({ ...emptyPlayer });
  const [submitting, setSubmitting] = useState(false);

  const teams       = useQuery(api.roster.listTeams);
  const players     = useQuery(api.roster.listPlayers, selectedTeam !== 'all' ? { teamId: selectedTeam as Id<'teams'> } : {});
  const createTeam  = useMutation(api.roster.createTeam);
  const createPlayer = useMutation(api.roster.addPlayer);
  const deletePlayer = useMutation(api.roster.deletePlayer);
  const updatePlayer = useMutation(api.roster.updatePlayer);

  async function handleTeamCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTeam({ name: teamForm.name, ageGroup: teamForm.ageGroup, season: teamForm.season });
      setTeamForm({ name: '', ageGroup: '', season: '2025-2026' });
      setShowTeamForm(false);
    } catch { /* noop */ }
    finally { setSubmitting(false); }
  }

  async function handlePlayerCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPlayer({
        name:          playerForm.name,
        age:           parseInt(playerForm.age),
        dateOfBirth:   playerForm.dateOfBirth,
        position:      playerForm.position,
        teamId:        playerForm.teamId ? (playerForm.teamId as Id<'teams'>) : undefined,
        jerseyNumber:  playerForm.jerseyNumber ? parseInt(playerForm.jerseyNumber) : undefined,
        guardianName:  playerForm.guardianName,
        guardianEmail: playerForm.guardianEmail,
        guardianPhone: playerForm.guardianPhone,
        notes:         playerForm.notes || undefined,
      });
      setPlayerForm({ ...emptyPlayer });
      setShowPlayerForm(false);
    } catch { /* noop */ }
    finally { setSubmitting(false); }
  }

  const posStyle: Record<Position, string> = {
    PG: 'bg-court-orange/15 text-court-orange',
    SG: 'bg-court-gold/15 text-court-gold',
    SF: 'bg-green-500/15 text-green-400',
    PF: 'bg-blue-500/15 text-blue-400',
    C:  'bg-purple-500/15 text-purple-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">Roster</h1>
          <p className="text-white/40 font-dm text-sm mt-1">Manage players and teams</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            className="btn-court text-xs py-2.5 px-4 border border-white/15 text-white/60 hover:text-white"
            whileHover={{ scale: 1.04 }}
            onClick={() => { setShowTeamForm(v => !v); setShowPlayerForm(false); }}
          >
            {showTeamForm ? 'Cancel' : '+ Add Team'}
          </motion.button>
          <motion.button
            className="btn-court bg-court-orange text-white text-xs py-2.5 px-4"
            style={{ boxShadow: '0 0 20px rgba(255,69,0,0.3)' }}
            whileHover={{ scale: 1.04 }}
            onClick={() => { setShowPlayerForm(v => !v); setShowTeamForm(false); }}
          >
            {showPlayerForm ? 'Cancel' : '+ Add Player'}
          </motion.button>
        </div>
      </div>

      {/* Team form */}
      <AnimatePresence>
        {showTeamForm && (
          <motion.form
            onSubmit={handleTeamCreate}
            className="glass rounded-2xl p-6 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="font-bebas text-xl text-white">Create Team</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <input placeholder="Team name *" required value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} className="input-court" />
              <input placeholder="Age group (e.g. 12–15)" required value={teamForm.ageGroup} onChange={e => setTeamForm(f => ({ ...f, ageGroup: e.target.value }))} className="input-court" />
              <input placeholder="Season" value={teamForm.season} onChange={e => setTeamForm(f => ({ ...f, season: e.target.value }))} className="input-court" />
            </div>
            <button type="submit" disabled={submitting} className="btn-court bg-court-orange text-white w-full disabled:opacity-50">
              {submitting ? 'Creating…' : 'Create Team'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Player form */}
      <AnimatePresence>
        {showPlayerForm && (
          <motion.form
            onSubmit={handlePlayerCreate}
            className="glass rounded-2xl p-6 space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="font-bebas text-xl text-white">Add Player</p>

            <div className="grid sm:grid-cols-3 gap-3">
              <input placeholder="Full name *" required value={playerForm.name} onChange={e => setPlayerForm(f => ({ ...f, name: e.target.value }))} className="input-court" />
              <input type="number" placeholder="Age *" required min={5} max={20} value={playerForm.age} onChange={e => setPlayerForm(f => ({ ...f, age: e.target.value }))} className="input-court" />
              <input type="date" required value={playerForm.dateOfBirth} onChange={e => setPlayerForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="input-court" />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <select value={playerForm.position} onChange={e => setPlayerForm(f => ({ ...f, position: e.target.value as Position }))} className="input-court">
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={playerForm.teamId} onChange={e => setPlayerForm(f => ({ ...f, teamId: e.target.value }))} className="input-court">
                <option value="">No team assigned</option>
                {(teams ?? []).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <input type="number" placeholder="Jersey #" min={0} max={99} value={playerForm.jerseyNumber} onChange={e => setPlayerForm(f => ({ ...f, jerseyNumber: e.target.value }))} className="input-court" />
            </div>

            <div className="court-line" />
            <p className="text-white/40 text-xs font-barlow tracking-widest uppercase">Guardian Info</p>

            <div className="grid sm:grid-cols-3 gap-3">
              <input placeholder="Guardian name *" required value={playerForm.guardianName} onChange={e => setPlayerForm(f => ({ ...f, guardianName: e.target.value }))} className="input-court" />
              <input type="email" placeholder="Guardian email *" required value={playerForm.guardianEmail} onChange={e => setPlayerForm(f => ({ ...f, guardianEmail: e.target.value }))} className="input-court" />
              <input type="tel" placeholder="Guardian phone *" required value={playerForm.guardianPhone} onChange={e => setPlayerForm(f => ({ ...f, guardianPhone: e.target.value }))} className="input-court" />
            </div>

            <textarea placeholder="Notes (optional)" rows={2} value={playerForm.notes} onChange={e => setPlayerForm(f => ({ ...f, notes: e.target.value }))} className="input-court w-full resize-none" />

            <button type="submit" disabled={submitting} className="btn-court bg-court-orange text-white w-full disabled:opacity-50">
              {submitting ? 'Adding…' : 'Add Player'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Team filter tabs */}
      {teams && teams.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTeam('all')}
            className={`px-3.5 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all border
              ${selectedTeam === 'all' ? 'bg-court-orange/20 text-court-orange border-court-orange/40' : 'text-white/40 border-white/10 hover:text-white'}`}
          >
            All Players
          </button>
          {teams.map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedTeam(t._id)}
              className={`px-3.5 py-1.5 rounded-full font-barlow text-xs tracking-widest uppercase transition-all border
                ${selectedTeam === t._id ? 'bg-court-orange/20 text-court-orange border-court-orange/40' : 'text-white/40 border-white/10 hover:text-white'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Players list */}
      {players === undefined ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
      ) : players.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
          <p className="text-white/25 font-dm text-sm">No players added yet.</p>
        </div>
      ) : (
        <>
          {/* ── Mobile card list (< md) ────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {players.map((player, i) => {
              const team = (teams ?? []).find(t => t._id === player.teamId);
              return (
                <motion.div
                  key={player._id}
                  className="glass rounded-xl p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Top row: jersey + name + delete */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Jersey number badge */}
                      <div className="w-10 h-10 rounded-full bg-court-orange/20 border border-court-orange/25 flex-shrink-0 flex items-center justify-center">
                        <span className="font-bebas text-lg text-court-orange leading-none">
                          {player.jerseyNumber ?? '—'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-dm text-white font-medium text-sm truncate">{player.name}</p>
                        <p className="text-white/30 text-xs">{player.dateOfBirth}</p>
                      </div>
                    </div>
                    {/* Delete — large touch target */}
                    <button
                      onClick={() => deletePlayer({ id: player._id })}
                      className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0 p-1.5 -mr-1"
                      aria-label="Delete player"
                    >
                      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 4h10M6 4V3h4v1M5 4l1 9h4l1-9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-barlow tracking-widest uppercase ${posStyle[player.position as Position] ?? ''}`}>
                      {player.position}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-barlow tracking-widest uppercase text-white/35 border border-white/10">
                      Age {player.age}
                    </span>
                    {team && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-barlow tracking-widest uppercase text-white/35 border border-white/10">
                        {team.name}
                      </span>
                    )}
                  </div>

                  {/* Guardian info */}
                  {(player.guardianName || player.guardianPhone) && (
                    <div className="mt-3 pt-3 border-t border-white/[0.05]">
                      <p className="text-white/35 text-xs font-dm">
                        {player.guardianName}
                        {player.guardianPhone ? ` · ${player.guardianPhone}` : ''}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ── Desktop table (≥ md) ──────────────────────────────────── */}
          <div className="hidden md:block rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {['#', 'Player', 'Pos', 'Age', 'Team', 'Guardian', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-barlow text-white/30 text-xs tracking-widest uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, i) => {
                    const team = (teams ?? []).find(t => t._id === player.teamId);
                    return (
                      <motion.tr
                        key={player._id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td className="px-4 py-3 font-bebas text-court-orange text-base">
                          {player.jerseyNumber ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-dm text-white text-sm font-medium">{player.name}</p>
                          <p className="text-white/30 text-xs">{player.dateOfBirth}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-barlow tracking-widest uppercase ${posStyle[player.position as Position] ?? ''}`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 text-sm font-dm">{player.age}</td>
                        <td className="px-4 py-3 text-white/40 text-sm font-dm">{team?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          <p className="text-white/50 text-xs font-dm">{player.guardianName}</p>
                          <p className="text-white/25 text-xs font-dm">{player.guardianPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deletePlayer({ id: player._id })}
                            className="text-red-400/50 hover:text-red-400 transition-colors"
                            aria-label="Delete player"
                          >
                            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M3 4h10M6 4V3h4v1M5 4l1 9h4l1-9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        .input-court{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;color:#EDE8DD;font-family:'DM Sans',sans-serif;font-size:0.875rem;padding:0.65rem 0.9rem;outline:none;transition:border-color 0.2s;}
        .input-court:focus{border-color:rgba(255,69,0,0.5);}
        .input-court::placeholder{color:rgba(237,232,221,0.25);}
        .input-court option{background:#111;color:#EDE8DD;}
        .input-court[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(0.3);}
      `}</style>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal';

interface Props { onClose: () => void }

const schedule = [
  { day: 'Monday',    time: '4:00 PM – 6:00 PM',  type: 'Skills Training',    age: 'Ages 8–11' },
  { day: 'Tuesday',   time: '5:00 PM – 7:00 PM',  type: 'Team Practice',      age: 'Ages 12–15' },
  { day: 'Wednesday', time: '4:30 PM – 6:30 PM',  type: 'Skills Training',    age: 'Ages 12–15' },
  { day: 'Thursday',  time: '5:00 PM – 7:00 PM',  type: 'Team Practice',      age: 'Ages 8–11' },
  { day: 'Saturday',  time: '9:00 AM – 12:00 PM', type: 'Game Day',           age: 'All Ages'   },
  { day: 'Sunday',    time: '10:00 AM – 12:00 PM',type: 'Open Gym',           age: 'All Ages'   },
];

const faqs = [
  {
    q: 'What age groups do you accept?',
    a: 'We welcome athletes aged 8–15. We have separate divisions for 8–11 and 12–15 to ensure age-appropriate competition and development.',
  },
  {
    q: 'What equipment do players need?',
    a: 'Players need basketball shoes, athletic shorts, and a water bottle. Jerseys and practice gear are provided when you join a team.',
  },
  {
    q: 'How are teams formed?',
    a: 'Teams are assembled after a brief skills evaluation during the first week. We balance teams to ensure fair competition.',
  },
  {
    q: 'Are there tryouts?',
    a: 'No formal tryouts — every registered athlete gets placed on a team. Evaluations simply help us build balanced rosters.',
  },
  {
    q: 'What does the season look like?',
    a: 'Each season runs 10 weeks: 8 weeks of regular games + 2 weeks of playoffs. Practices run throughout the week (see schedule above).',
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.07]">
      <button
        className="w-full flex items-center justify-between py-4 text-left text-court-cream/80 hover:text-white transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-dm text-sm font-medium pr-4">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-court-orange flex-shrink-0"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v10M3 8h10" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-white/50 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GamePlanModal({ onClose }: Props) {
  return (
    <Modal onClose={onClose} title="Game Plan" maxWidth="max-w-2xl">
      <div className="space-y-8">

        {/* Program overview */}
        <div>
          <p className="text-court-orange font-barlow text-xs tracking-[0.3em] uppercase mb-3">Overview</p>
          <p className="text-white/60 text-sm leading-relaxed">
            Youth Basketball provides structured training, team play, and competitive leagues for athletes ages 8–15.
            Our certified coaches focus on fundamentals, teamwork, and love of the game.
          </p>
        </div>

        <div className="court-line" />

        {/* Weekly Schedule */}
        <div>
          <p className="text-court-orange font-barlow text-xs tracking-[0.3em] uppercase mb-4">Weekly Schedule</p>
          <div className="space-y-2">
            {schedule.map(({ day, time, type, age }) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]"
              >
                <span className="font-bebas text-court-orange text-base w-24 shrink-0">{day}</span>
                <span className="text-white/70 text-sm flex-1">{time}</span>
                <span className="text-white/50 text-sm">{type}</span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-court-orange/10 text-court-orange text-xs font-barlow shrink-0">
                  {age}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="court-line" />

        {/* Rules & Info */}
        <div>
          <p className="text-court-orange font-barlow text-xs tracking-[0.3em] uppercase mb-3">Rules & Guidelines</p>
          <ul className="space-y-2 text-sm text-white/60">
            {[
              'Players must arrive 10 minutes before sessions.',
              'Respectful conduct toward coaches, teammates, and opponents.',
              'Standard NBA rules apply with age-appropriate modifications.',
              'Minimum 75% practice attendance required to play in games.',
              'All participants must have a signed waiver on file.',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-court-orange mt-0.5">▸</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="court-line" />

        {/* FAQ accordion */}
        <div>
          <p className="text-court-orange font-barlow text-xs tracking-[0.3em] uppercase mb-2">FAQ</p>
          {faqs.map(({ q, a }) => <AccordionItem key={q} q={q} a={a} />)}
        </div>

      </div>
    </Modal>
  );
}

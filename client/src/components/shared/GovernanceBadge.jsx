import React from 'react';

// Governance badges use iCAA Black as the base â€” these are authority positions
// President and VP get the iCAA Red treatment â€” leadership tier
const POSITION_CONFIG = {
  president: { 
    label: 'President', 
    bg: 'bg-[#b9123f]',      // iCAA Red â€” top leadership
    text: 'text-white',
    border: ''
  },
  vice_president: { 
    label: 'Vice President', 
    bg: 'bg-[#b9123f]/80', 
    text: 'text-white',
    border: ''
  },
  treasurer: { 
    label: 'Treasurer', 
    bg: 'bg-[#282827]',       // iCAA Black â€” authority
    text: 'text-white',
    border: ''
  },
  secretary: { 
    label: 'Secretary', 
    bg: 'bg-[#282827]', 
    text: 'text-white',
    border: ''
  },
  parliamentarian: { 
    label: 'Parliamentarian', 
    bg: 'bg-[#383838]',       // iCAA Gray â€” structured role
    text: 'text-white',
    border: ''
  },
  tech_lead: { 
    label: 'Tech Lead', 
    bg: 'bg-[#383838]',
    text: 'text-white',
    border: ''
  },
  tech_member: { 
    label: 'Tech', 
    bg: 'bg-[#383838]/70',
    text: 'text-white',
    border: ''
  },
};

export default function GovernanceBadge({ position, size = "sm" }) {
  const config = POSITION_CONFIG[position];
  if (!config) return null;
  
  const sizeClass = size === 'xs' 
    ? 'text-xs px-1.5 py-0.5' 
    : 'text-xs px-2 py-1';
  
  return (
    <span className={`inline-flex items-center rounded-md font-semibold tracking-wide ${sizeClass} ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

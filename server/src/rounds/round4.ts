export interface QuarantineCard {
  id: string;
  text: string;
  action: 'ALLOW' | 'BLOCK';
  explanation: string;
}

export function getQuarantineCards(): QuarantineCard[] {
  // Real implementation needs 24 cards, simplified here
  return [
    { id: '1', text: 'Email from admin asking for password.', action: 'BLOCK', explanation: 'Admins never ask for passwords.' },
    { id: '2', text: 'Login via university official portal.', action: 'ALLOW', explanation: 'Official portals are safe.' },
    // ... add more to reach 24
  ];
}

export function generatePlayerCards(seed: string): QuarantineCard[] {
  const allCards = getQuarantineCards();
  // Return 8 random cards based on seed
  return allCards.slice(0, 8); // Simplified
}

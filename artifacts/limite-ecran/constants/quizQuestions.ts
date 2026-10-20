export type SchoolSubject = 'maths' | 'francais' | 'anglais';

export type QuizQuestion = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
};

export const SCHOOL_SUBJECTS: {
  id: SchoolSubject;
  label: string;
  description: string;
  icon: 'hash' | 'type' | 'globe';
}[] = [
  { id: 'maths', label: 'Maths', description: 'Calcul & logique', icon: 'hash' },
  { id: 'francais', label: 'Français', description: 'Grammaire & vocabulaire', icon: 'type' },
  { id: 'anglais', label: 'Anglais', description: 'Mots & grammaire', icon: 'globe' },
];

export const QUIZ_QUESTIONS: Record<SchoolSubject, QuizQuestion[]> = {
  maths: [
    {
      prompt: 'Combien font 8 × 7 ?',
      options: ['54', '56', '64', '49'],
      correctIndex: 1,
      explanation: '8 × 7 = 56.',
    },
    {
      prompt: 'Combien font 48 ÷ 6 ?',
      options: ['6', '7', '8', '9'],
      correctIndex: 2,
      explanation: '48 partagé en 6 parts égales donne 8.',
    },
    {
      prompt: 'Quel est le résultat de 35 + 27 ?',
      options: ['52', '62', '63', '72'],
      correctIndex: 1,
      explanation: '35 + 20 = 55, puis + 7 = 62.',
    },
    {
      prompt: 'Les trois quarts de 20, c’est…',
      options: ['5', '10', '15', '18'],
      correctIndex: 2,
      explanation: '20 ÷ 4 = 5, puis 5 × 3 = 15.',
    },
    {
      prompt: 'Un carré a des côtés de 5 cm. Quel est son périmètre ?',
      options: ['10 cm', '15 cm', '20 cm', '25 cm'],
      correctIndex: 2,
      explanation: 'Le périmètre est 4 × 5 cm, soit 20 cm.',
    },
  ],
  francais: [
    {
      prompt: 'Quel est le féminin de « heureux » ?',
      options: ['heureuse', 'heureuxe', 'heureus', 'heureusee'],
      correctIndex: 0,
      explanation: 'On écrit « heureuse » au féminin.',
    },
    {
      prompt: 'Dans « Le petit chat dort », quel mot est l’adjectif ?',
      options: ['Le', 'petit', 'chat', 'dort'],
      correctIndex: 1,
      explanation: '« Petit » précise le nom « chat » : c’est un adjectif.',
    },
    {
      prompt: 'Quel est le pluriel de « un cheval » ?',
      options: ['chevals', 'chevaux', 'chevaus', 'chevales'],
      correctIndex: 1,
      explanation: 'Le pluriel de « cheval » est « chevaux ».',
    },
    {
      prompt: 'Quel est l’infinitif du verbe dans « Nous finissons le livre » ?',
      options: ['faire', 'finir', 'fini', 'finissons'],
      correctIndex: 1,
      explanation: '« Finissons » est une forme conjuguée du verbe « finir ».',
    },
    {
      prompt: 'Quelle phrase est correctement écrite ?',
      options: [
        'Elles sont arrivé.',
        'Elles sont arrivées.',
        'Elles sont arriver.',
        'Elle sont arrivées.',
      ],
      correctIndex: 1,
      explanation: 'Avec « elles », le participe passé s’accorde : « arrivées ».',
    },
  ],
  anglais: [
    {
      prompt: 'Que signifie le mot anglais « apple » ?',
      options: ['poire', 'pomme', 'orange', 'raisin'],
      correctIndex: 1,
      explanation: '« Apple » signifie « pomme ».',
    },
    {
      prompt: 'Complète : « She ___ music every day. »',
      options: ['listen', 'listening', 'listens', 'listened'],
      correctIndex: 2,
      explanation: 'Au présent, on ajoute -s à la troisième personne : « listens ».',
    },
    {
      prompt: 'Quelle est la bonne traduction de « Good morning » ?',
      options: ['Bonne nuit', 'Bonjour', 'À bientôt', 'Merci'],
      correctIndex: 1,
      explanation: '« Good morning » signifie « Bonjour » le matin.',
    },
    {
      prompt: 'Quel est le pluriel de « one mouse » ?',
      options: ['mouses', 'mice', 'mousees', 'meese'],
      correctIndex: 1,
      explanation: 'Le pluriel irrégulier de « mouse » est « mice ».',
    },
    {
      prompt: 'Complète : « I ___ a student. »',
      options: ['is', 'are', 'am', 'be'],
      correctIndex: 2,
      explanation: 'Avec « I », le verbe « to be » se conjugue « am ».',
    },
  ],
};

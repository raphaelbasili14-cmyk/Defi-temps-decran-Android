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

const QUIZ_LENGTH = 5;
type QuestionFactory = () => QuizQuestion;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: readonly T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function makeQuestion(
  prompt: string,
  answer: string,
  possibleDistractors: readonly string[],
  explanation: string,
): QuizQuestion {
  const distractors = shuffle([...new Set(possibleDistractors.filter((item) => item !== answer))])
    .slice(0, 3);
  if (distractors.length < 3) {
    throw new Error(`La question « ${prompt} » n'a pas trois réponses incorrectes distinctes.`);
  }

  const options = shuffle([answer, ...distractors]) as QuizQuestion['options'];
  return {
    prompt,
    options,
    correctIndex: options.indexOf(answer),
    explanation,
  };
}

function makeNumericQuestion(
  prompt: string,
  answer: number,
  explanation: string,
  possibleDistractors: readonly number[],
  suffix = '',
): QuizQuestion {
  const distractors = new Set(
    possibleDistractors.filter((item) => Number.isInteger(item) && item >= 0 && item !== answer),
  );
  for (let offset = 1; distractors.size < 3; offset += 1) {
    distractors.add(answer + offset);
  }

  const format = (value: number) => `${value}${suffix}`;
  return makeQuestion(
    prompt,
    format(answer),
    [...distractors].map(format),
    explanation,
  );
}

function sameQuestionSet(first: readonly QuizQuestion[], second: readonly QuizQuestion[]): boolean {
  if (first.length !== second.length || first.length === 0) return false;
  const firstPrompts = first.map((question) => question.prompt).sort();
  const secondPrompts = second.map((question) => question.prompt).sort();
  return firstPrompts.every((prompt, index) => prompt === secondPrompts[index]);
}

function buildRandomQuiz(
  factories: readonly QuestionFactory[],
  previousQuestions: readonly QuizQuestion[],
): QuizQuestion[] {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const questions = shuffle(factories).slice(0, QUIZ_LENGTH).map((factory) => factory());
    if (!sameQuestionSet(questions, previousQuestions)) return questions;
  }

  // Even if randomness repeats, change the order so a retry is never identical.
  return shuffle(factories).slice(0, QUIZ_LENGTH).map((factory) => factory());
}

const mathsFactories: QuestionFactory[] = [
  () => {
    const first = randomInt(12, 89);
    const second = randomInt(11, 79);
    const answer = first + second;
    return makeNumericQuestion(
      `Combien font ${first} + ${second} ?`,
      answer,
      `${first} + ${second} = ${answer}.`,
      [answer + 1, answer - 1, answer + 10, answer - 10],
    );
  },
  () => {
    const first = randomInt(20, 99);
    const second = randomInt(2, first - 1);
    const answer = first - second;
    return makeNumericQuestion(
      `Combien font ${first} − ${second} ?`,
      answer,
      `${first} − ${second} = ${answer}.`,
      [answer + 1, answer - 1, answer + 10, answer - 10],
    );
  },
  () => {
    const first = randomInt(2, 12);
    const second = randomInt(2, 12);
    const answer = first * second;
    return makeNumericQuestion(
      `Combien font ${first} × ${second} ?`,
      answer,
      `${first} × ${second} = ${answer}.`,
      [answer + first, answer - second, (first + 1) * second, answer + 1],
    );
  },
  () => {
    const divisor = randomInt(2, 12);
    const answer = randomInt(2, 12);
    const dividend = divisor * answer;
    return makeNumericQuestion(
      `Combien font ${dividend} ÷ ${divisor} ?`,
      answer,
      `${dividend} ÷ ${divisor} = ${answer}.`,
      [answer + 1, answer - 1, answer + 2, divisor],
    );
  },
  () => {
    const length = randomInt(4, 15);
    const width = randomInt(2, 10);
    const answer = 2 * (length + width);
    return makeNumericQuestion(
      `Quel est le périmètre d’un rectangle de ${length} cm sur ${width} cm ?`,
      answer,
      `Le périmètre vaut 2 × (${length} + ${width}) = ${answer} cm.`,
      [length + width, answer + length, answer + width, answer - 2],
      ' cm',
    );
  },
  () => {
    const denominator = randomInt(2, 5);
    const numerator = randomInt(1, denominator - 1);
    const whole = denominator * randomInt(2, 10);
    const answer = numerator * (whole / denominator);
    return makeNumericQuestion(
      `Combien font ${numerator}/${denominator} de ${whole} ?`,
      answer,
      `${whole} ÷ ${denominator} × ${numerator} = ${answer}.`,
      [answer + 1, answer - 1, whole - answer, answer + denominator],
    );
  },
];

const feminineAdjectives = [
  { masculine: 'heureux', feminine: 'heureuse' },
  { masculine: 'petit', feminine: 'petite' },
  { masculine: 'sportif', feminine: 'sportive' },
  { masculine: 'curieux', feminine: 'curieuse' },
  { masculine: 'actif', feminine: 'active' },
  { masculine: 'fier', feminine: 'fière' },
  { masculine: 'nouveau', feminine: 'nouvelle' },
  { masculine: 'blanc', feminine: 'blanche' },
  { masculine: 'gentil', feminine: 'gentille' },
  { masculine: 'sérieux', feminine: 'sérieuse' },
  { masculine: 'généreux', feminine: 'généreuse' },
  { masculine: 'premier', feminine: 'première' },
];

const pluralNouns = [
  { singular: 'cheval', plural: 'chevaux', wrong: ['chevals', 'chevaus', 'chevales'] },
  { singular: 'journal', plural: 'journaux', wrong: ['journals', 'journalx', 'journalès'] },
  { singular: 'animal', plural: 'animaux', wrong: ['animals', 'animalx', 'animales'] },
  { singular: 'bateau', plural: 'bateaux', wrong: ['bateaus', 'bateauxs', 'bateausx'] },
  { singular: 'gâteau', plural: 'gâteaux', wrong: ['gâteaus', 'gâteaues', 'gâteauax'] },
  { singular: 'jeu', plural: 'jeux', wrong: ['jeus', 'jeues', 'jeuxs'] },
  { singular: 'travail', plural: 'travaux', wrong: ['travails', 'travailx', 'travailes'] },
  { singular: 'bijou', plural: 'bijoux', wrong: ['bijous', 'bijoues', 'bijouxs'] },
  { singular: 'pneu', plural: 'pneus', wrong: ['pneux', 'pneues', 'pneaux'] },
  { singular: 'festival', plural: 'festivals', wrong: ['festivaux', 'festivalx', 'festivales'] },
  { singular: 'souris', plural: 'souris', wrong: ['sourises', 'sourix', 'souriss'] },
  { singular: 'nez', plural: 'nez', wrong: ['nezes', 'nezz', 'neaux'] },
];

const infinitiveQuestions = [
  { sentence: 'Nous finissons notre travail.', verb: 'finir', wrong: ['faire', 'fini', 'finissons'] },
  { sentence: 'Elles choisissent un livre.', verb: 'choisir', wrong: ['choisirent', 'choisie', 'choisissent'] },
  { sentence: 'Ils prennent le bus.', verb: 'prendre', wrong: ['prend', 'prenant', 'prendrez'] },
  { sentence: 'Tu vas à l’école.', verb: 'aller', wrong: ['vais', 'allé', 'venir'] },
  { sentence: 'Nous faisons un gâteau.', verb: 'faire', wrong: ['faisons', 'fait', 'fabriquer'] },
  { sentence: 'Vous écrivez une lettre.', verb: 'écrire', wrong: ['écrit', 'écrivons', 'lecture'] },
  { sentence: 'Je vois les montagnes.', verb: 'voir', wrong: ['vois', 'vu', 'regarder'] },
  { sentence: 'Il vient avec nous.', verb: 'venir', wrong: ['vient', 'venu', 'aller'] },
  { sentence: 'Elles partent demain.', verb: 'partir', wrong: ['part', 'parties', 'sortir'] },
  { sentence: 'Tu réponds à la question.', verb: 'répondre', wrong: ['réponse', 'répond', 'répondu'] },
];

const adjectiveSentences = [
  { article: 'Le', adjective: 'petit', noun: 'chat', verb: 'dort' },
  { article: 'La', adjective: 'grande', noun: 'tortue', verb: 'avance' },
  { article: 'Un', adjective: 'jeune', noun: 'musicien', verb: 'joue' },
  { article: 'Une', adjective: 'jolie', noun: 'fleur', verb: 'pousse' },
  { article: 'Les', adjective: 'petits', noun: 'oiseaux', verb: 'chantent' },
  { article: 'Le', adjective: 'vieux', noun: 'chêne', verb: 'grandit' },
  { article: 'La', adjective: 'douce', noun: 'musique', verb: 'commence' },
  { article: 'Un', adjective: 'gros', noun: 'nuage', verb: 'arrive' },
  { article: 'Une', adjective: 'longue', noun: 'route', verb: 'serpente' },
  { article: 'Les', adjective: 'jeunes', noun: 'joueurs', verb: 's’entraînent' },
];

const homophoneQuestions = [
  { sentence: 'Les enfants ___ déjà prêts.', answer: 'sont', wrong: ['son', 'sons', 'sontt'], explanation: '« Sont » est le verbe être ; on peut le remplacer par « étaient ».' },
  { sentence: 'Lina ___ un nouveau cahier.', answer: 'a', wrong: ['à', 'as', 'ha'], explanation: '« A » est le verbe avoir ; on peut dire « avait un nouveau cahier ».' },
  { sentence: 'Il ___ son frère vont au parc.', answer: 'et', wrong: ['est', 'ait', 'es'], explanation: '« Et » sert à relier deux personnes ; on peut le remplacer par « et puis ».' },
  { sentence: 'Paul range ___ chaussures.', answer: 'ses', wrong: ['ces', 'c’est', 's’est'], explanation: '« Ses » indique que les chaussures lui appartiennent.' },
  { sentence: '___ joue au ballon dans la cour.', answer: 'On', wrong: ['Ont', 'Onn', 'Ons'], explanation: '« On » est un pronom ; « ont » est le verbe avoir.' },
  { sentence: 'Le livre est posé ___ la table.', answer: 'sur', wrong: ['sûr', 'sous', 'sourd'], explanation: '« Sur » indique que le livre est au-dessus de la table.' },
  { sentence: 'Maya ___ très contente.', answer: 'est', wrong: ['et', 'es', 'ait'], explanation: '« Est » est le verbe être ; on peut dire « était très contente ».' },
  { sentence: 'Il ___ arrivé en avance.', answer: 'est', wrong: ['et', 'ai', 'ait'], explanation: 'Au passé composé, « est arrivé » se forme avec le verbe être.' },
];

const agreementQuestions = [
  { prompt: 'Choisis la phrase correctement accordée :', answer: 'Les filles sont arrivées.', wrong: ['Les filles sont arrivé.', 'Les filles sont arriver.', 'Les filles est arrivées.'], explanation: 'Avec « les filles », le participe passé s’accorde au féminin pluriel : « arrivées ».' },
  { prompt: 'Choisis la phrase correctement écrite :', answer: 'Elle a mangé une pomme.', wrong: ['Elle a manger une pomme.', 'Elle as mangé une pomme.', 'Elle a mangée une pomme.'], explanation: 'On écrit « elle a mangé » : le verbe avoir prend « a » et le participe passé reste ici invariable.' },
  { prompt: 'Choisis la phrase correctement accordée :', answer: 'Ils sont partis tôt.', wrong: ['Ils sont parti tôt.', 'Ils sont partir tôt.', 'Ils est partis tôt.'], explanation: 'Avec « ils », le participe passé de « partir » s’accorde au masculin pluriel : « partis ».' },
  { prompt: 'Choisis la phrase correctement écrite :', answer: 'Nous avons fini nos devoirs.', wrong: ['Nous avons finis nos devoirs.', 'Nous avons finir nos devoirs.', 'Nous avons finie nos devoirs.'], explanation: 'Avec « avoir », le participe passé de « finir » est « fini » dans cette phrase.' },
  { prompt: 'Choisis la phrase correctement accordée :', answer: 'La porte est ouverte.', wrong: ['La porte est ouvert.', 'La porte est ouvrent.', 'Le porte est ouverte.'], explanation: '« Porte » est féminin singulier : on écrit « ouverte ».' },
];

const frenchFactories: QuestionFactory[] = [
  () => {
    const item = pick(feminineAdjectives);
    return makeQuestion(
      `Quel est le féminin de « ${item.masculine} » ?`,
      item.feminine,
      feminineAdjectives.map((adjective) => adjective.feminine),
      `Au féminin, « ${item.masculine} » s’écrit « ${item.feminine} » .`,
    );
  },
  () => {
    const item = pick(pluralNouns);
    return makeQuestion(
      `Quel est le pluriel de « un ${item.singular} » ?`,
      item.plural,
      item.wrong,
      `Le pluriel de « ${item.singular} » est « ${item.plural} » .`,
    );
  },
  () => {
    const item = pick(infinitiveQuestions);
    return makeQuestion(
      `Quel est l’infinitif du verbe dans « ${item.sentence} »`,
      item.verb,
      item.wrong,
      `Le verbe conjugué dans cette phrase est « ${item.verb} » à l’infinitif.`,
    );
  },
  () => {
    const item = pick(adjectiveSentences);
    const sentence = `${item.article} ${item.adjective} ${item.noun} ${item.verb}.`;
    return makeQuestion(
      `Dans « ${sentence} », quel mot est l’adjectif ?`,
      item.adjective,
      [item.article, item.noun, item.verb],
      `« ${item.adjective} » précise le nom « ${item.noun} » : c’est l’adjectif.`,
    );
  },
  () => {
    const item = pick(homophoneQuestions);
    return makeQuestion(
      `Complète la phrase : « ${item.sentence} »`,
      item.answer,
      item.wrong,
      item.explanation,
    );
  },
  () => {
    const item = pick(agreementQuestions);
    return makeQuestion(item.prompt, item.answer, item.wrong, item.explanation);
  },
];

const englishVocabulary = [
  { english: 'apple', french: 'pomme' },
  { english: 'window', french: 'fenêtre' },
  { english: 'book', french: 'livre' },
  { english: 'bread', french: 'pain' },
  { english: 'garden', french: 'jardin' },
  { english: 'weather', french: 'temps' },
  { english: 'chair', french: 'chaise' },
  { english: 'cloud', french: 'nuage' },
  { english: 'to borrow', french: 'emprunter' },
  { english: 'to choose', french: 'choisir' },
  { english: 'quiet', french: 'calme' },
  { english: 'early', french: 'tôt' },
  { english: 'always', french: 'toujours' },
  { english: 'kitchen', french: 'cuisine' },
  { english: 'journey', french: 'voyage' },
  { english: 'neighbour', french: 'voisin' },
  { english: 'careful', french: 'prudent' },
  { english: 'to improve', french: 'améliorer' },
  { english: 'sometimes', french: 'parfois' },
  { english: 'thirsty', french: 'assoiffé' },
  { english: 'to explain', french: 'expliquer' },
  { english: 'friendly', french: 'amical' },
  { english: 'corner', french: 'coin' },
  { english: 'to forget', french: 'oublier' },
];

const beSubjects = [
  { subject: 'I', answer: 'am', french: 'je' },
  { subject: 'you', answer: 'are', french: 'tu' },
  { subject: 'he', answer: 'is', french: 'il' },
  { subject: 'she', answer: 'is', french: 'elle' },
  { subject: 'it', answer: 'is', french: 'il/elle (une chose)' },
  { subject: 'we', answer: 'are', french: 'nous' },
  { subject: 'they', answer: 'are', french: 'ils/elles' },
];

const presentSimpleQuestions = [
  { subject: 'She', verb: 'play', answer: 'plays', ending: 'tennis', wrong: ['play', 'playing', 'played'] },
  { subject: 'He', verb: 'watch', answer: 'watches', ending: 'a film', wrong: ['watch', 'watching', 'watched'] },
  { subject: 'She', verb: 'study', answer: 'studies', ending: 'English', wrong: ['study', 'studying', 'studyed'] },
  { subject: 'He', verb: 'go', answer: 'goes', ending: 'to school', wrong: ['go', 'going', 'goed'] },
  { subject: 'She', verb: 'read', answer: 'reads', ending: 'every evening', wrong: ['read', 'reading', 'readed'] },
  { subject: 'He', verb: 'have', answer: 'has', ending: 'a blue bag', wrong: ['have', 'having', 'haves'] },
  { subject: 'She', verb: 'do', answer: 'does', ending: 'her homework', wrong: ['do', 'doing', 'dos'] },
  { subject: 'He', verb: 'wash', answer: 'washes', ending: 'his hands', wrong: ['wash', 'washing', 'washs'] },
  { subject: 'She', verb: 'carry', answer: 'carries', ending: 'her books', wrong: ['carry', 'carrying', 'carrys'] },
  { subject: 'He', verb: 'eat', answer: 'eats', ending: 'an apple', wrong: ['eat', 'eating', 'eated'] },
];

const englishPlurals = [
  { singular: 'mouse', plural: 'mice' },
  { singular: 'child', plural: 'children' },
  { singular: 'foot', plural: 'feet' },
  { singular: 'tooth', plural: 'teeth' },
  { singular: 'person', plural: 'people' },
  { singular: 'man', plural: 'men' },
  { singular: 'woman', plural: 'women' },
  { singular: 'goose', plural: 'geese' },
  { singular: 'box', plural: 'boxes' },
  { singular: 'city', plural: 'cities' },
  { singular: 'bus', plural: 'buses' },
  { singular: 'shelf', plural: 'shelves' },
];

const pastSimpleQuestions = [
  { verb: 'visit', answer: 'visited', wrong: ['visit', 'visiting', 'visits'], ending: 'my aunt yesterday' },
  { verb: 'go', answer: 'went', wrong: ['goed', 'goes', 'going'], ending: 'to the park yesterday' },
  { verb: 'see', answer: 'saw', wrong: ['seed', 'seen', 'see'], ending: 'a rainbow this morning' },
  { verb: 'make', answer: 'made', wrong: ['maked', 'making', 'makes'], ending: 'a cake last weekend' },
  { verb: 'play', answer: 'played', wrong: ['play', 'playing', 'plays'], ending: 'football yesterday' },
  { verb: 'write', answer: 'wrote', wrong: ['writed', 'written', 'writes'], ending: 'a letter last night' },
  { verb: 'eat', answer: 'ate', wrong: ['eated', 'eaten', 'eats'], ending: 'lunch at noon' },
  { verb: 'take', answer: 'took', wrong: ['taked', 'taken', 'takes'], ending: 'the bus yesterday' },
  { verb: 'clean', answer: 'cleaned', wrong: ['clean', 'cleaning', 'cleans'], ending: 'my room on Saturday' },
  { verb: 'buy', answer: 'bought', wrong: ['buyed', 'buying', 'buys'], ending: 'a new notebook' },
];

const prepositionQuestions = [
  { prompt: 'The book is ___ the table.', answer: 'on', wrong: ['in', 'under', 'between'], explanation: '« On the table » signifie que le livre est posé sur la table.' },
  { prompt: 'The shoes are ___ the bed.', answer: 'under', wrong: ['on', 'between', 'above'], explanation: '« Under the bed » signifie que les chaussures sont sous le lit.' },
  { prompt: 'The milk is ___ the fridge.', answer: 'in', wrong: ['on', 'under', 'between'], explanation: '« In the fridge » signifie que le lait est dans le réfrigérateur.' },
  { prompt: 'The school is ___ the library and the park.', answer: 'between', wrong: ['under', 'inside', 'above'], explanation: '« Between » signifie « entre » deux endroits.' },
  { prompt: 'The picture is ___ the sofa.', answer: 'above', wrong: ['between', 'inside', 'under'], explanation: '« Above the sofa » signifie que le tableau est au-dessus du canapé.' },
  { prompt: 'The cat is ___ the box.', answer: 'inside', wrong: ['between', 'above', 'across'], explanation: '« Inside the box » signifie que le chat est à l’intérieur de la boîte.' },
];

const englishFactories: QuestionFactory[] = [
  () => {
    const item = pick(englishVocabulary);
    return makeQuestion(
      `Que signifie le mot anglais « ${item.english} » ?`,
      item.french,
      englishVocabulary.map((word) => word.french),
      `« ${item.english} » signifie « ${item.french} » .`,
    );
  },
  () => {
    const item = pick(beSubjects);
    const answer = item.answer;
    return makeQuestion(
      `Complète en anglais : « ${item.subject} ___ ready. »`,
      answer,
      ['am', 'is', 'are', 'be'],
      `Avec « ${item.subject} » ( ${item.french} ), le verbe « to be » se conjugue « ${answer} ».`,
    );
  },
  () => {
    const item = pick(presentSimpleQuestions);
    return makeQuestion(
      `Complète : « ${item.subject} ___ ${item.ending}. »`,
      item.answer,
      item.wrong,
      `Au présent simple, avec « ${item.subject} », on écrit « ${item.answer} ».`,
    );
  },
  () => {
    const item = pick(englishPlurals);
    return makeQuestion(
      `Quel est le pluriel de « ${item.singular} » ?`,
      item.plural,
      englishPlurals.map((word) => word.plural),
      `Le pluriel de « ${item.singular} » est « ${item.plural} » .`,
    );
  },
  () => {
    const item = pick(pastSimpleQuestions);
    return makeQuestion(
      `Complète au passé : « Yesterday, I ___ ${item.ending}. »`,
      item.answer,
      item.wrong,
      `Le prétérit de « ${item.verb} » est « ${item.answer} ».`,
    );
  },
  () => {
    const item = pick(prepositionQuestions);
    return makeQuestion(
      `Complète : « ${item.prompt} »`,
      item.answer,
      item.wrong,
      item.explanation,
    );
  },
];

export function generateQuizQuestions(
  subject: SchoolSubject,
  previousQuestions: readonly QuizQuestion[] = [],
): QuizQuestion[] {
  const factories = subject === 'maths'
    ? mathsFactories
    : subject === 'francais'
      ? frenchFactories
      : englishFactories;
  return buildRandomQuiz(factories, previousQuestions);
}

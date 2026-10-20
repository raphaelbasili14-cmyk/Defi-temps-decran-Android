import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  QUIZ_QUESTIONS,
  SCHOOL_SUBJECTS,
  type SchoolSubject,
} from '@/constants/quizQuestions';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

const PASSING_SCORE = 4;

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, addChallengeBonus } = useAppData();
  const [subject, setSubject] = useState<SchoolSubject | null>(null);
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [bonusGranted, setBonusGranted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const questions = subject ? QUIZ_QUESTIONS[subject] : [];
  const currentQuestion = questions[questionIndex];
  const isPassing = correctAnswers >= PASSING_SCORE;

  const chooseSubject = (nextSubject: SchoolSubject) => {
    void Haptics.selectionAsync();
    setSubject(nextSubject);
  };

  const startQuiz = () => {
    if (!subject) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStarted(true);
    setFinished(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setBonusGranted(false);
    setSaveError(null);
  };

  const answerQuestion = (index: number) => {
    if (!currentQuestion || selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === currentQuestion.correctIndex) {
      setCorrectAnswers((score) => score + 1);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const nextQuestion = () => {
    if (questionIndex === questions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  };

  const restartQuiz = () => {
    setFinished(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setBonusGranted(false);
    setSaveError(null);
  };

  const claimBonus = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await addChallengeBonus();
      setBonusGranted(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setSaveError('Le bonus n’a pas pu être enregistré. Réessaie.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 10, paddingBottom: bottomInset + 22 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            testID="quiz-back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Défi scolaire
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {!started ? (
          <>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              5 QUESTIONS · 4 BONNES RÉPONSES POUR RÉUSSIR
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Choisis ta matière.
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Réponds à cinq questions. Il faut au moins quatre bonnes réponses pour gagner tes minutes.
            </Text>

            <View style={styles.subjectList}>
              {SCHOOL_SUBJECTS.map((item) => {
                const isSelected = subject === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    testID={`subject-${item.id}`}
                    onPress={() => chooseSubject(item.id)}
                    style={({ pressed }) => [
                      styles.subjectCard,
                      {
                        backgroundColor: isSelected ? colors.secondary : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: pressed ? 0.78 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.subjectIcon,
                        { backgroundColor: isSelected ? colors.primary : colors.secondary },
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={19}
                        color={isSelected ? colors.primaryForeground : colors.primary}
                      />
                    </View>
                    <View style={styles.subjectCopy}>
                      <Text style={[styles.subjectTitle, { color: colors.foreground }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.subjectDescription, { color: colors.mutedForeground }]}>
                        {item.description}
                      </Text>
                    </View>
                    {isSelected ? (
                      <Feather name="check-circle" size={19} color={colors.primary} />
                    ) : (
                      <Feather name="circle" size={19} color={colors.mutedForeground} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.rewardPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="zap" size={18} color={colors.primary} />
              <Text style={[styles.rewardText, { color: colors.foreground }]}>
                Réussis le quiz et gagne {data.bonusMinutes} minutes supplémentaires.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              testID="begin-quiz"
              disabled={!subject}
              onPress={startQuiz}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: !subject ? 0.4 : pressed ? 0.82 : 1,
                },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                Commencer le quiz
              </Text>
              <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
            </Pressable>
          </>
        ) : finished ? (
          <View style={styles.resultArea}>
            <View
              style={[
                styles.resultIcon,
                { backgroundColor: isPassing ? colors.primary : colors.secondary },
              ]}
            >
              <Feather
                name={isPassing ? 'award' : 'rotate-ccw'}
                size={26}
                color={isPassing ? colors.primaryForeground : colors.primary}
              />
            </View>
            <Text style={[styles.title, styles.resultTitle, { color: colors.foreground }]}>
              {isPassing ? 'Bien joué !' : 'Encore un essai ?'}
            </Text>
            <Text style={[styles.resultScore, { color: colors.primary }]}>
              {correctAnswers} / {questions.length}
            </Text>
            <Text style={[styles.subtitle, styles.resultSubtitle, { color: colors.mutedForeground }]}>
              {isPassing
                ? `Tu as réussi le quiz de ${SCHOOL_SUBJECTS.find((item) => item.id === subject)?.label}.`
                : `Il faut ${PASSING_SCORE} bonnes réponses. Revois les explications et retente le quiz.`}
            </Text>
            {isPassing && !bonusGranted ? (
              <Pressable
                accessibilityRole="button"
                testID="claim-quiz-bonus"
                disabled={isSaving}
                onPress={() => void claimBonus()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: isSaving ? 0.55 : pressed ? 0.82 : 1,
                  },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <>
                    <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                      Gagner +{data.bonusMinutes} min
                    </Text>
                    <Feather name="plus-circle" size={17} color={colors.primaryForeground} />
                  </>
                )}
              </Pressable>
            ) : isPassing ? (
              <Pressable
                accessibilityRole="button"
                testID="quiz-home"
                onPress={() => router.replace('/')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  Retour à l’accueil
                </Text>
                <Feather name="check" size={17} color={colors.primaryForeground} />
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                testID="retry-quiz"
                onPress={restartQuiz}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  Recommencer
                </Text>
                <Feather name="rotate-ccw" size={17} color={colors.primaryForeground} />
              </Pressable>
            )}
            {saveError ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {saveError}
              </Text>
            ) : null}
          </View>
        ) : currentQuestion ? (
          <>
            <View style={styles.quizMeta}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                {SCHOOL_SUBJECTS.find((item) => item.id === subject)?.label.toUpperCase()}
              </Text>
              <Text style={[styles.questionCount, { color: colors.mutedForeground }]}>
                {questionIndex + 1} / {questions.length}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${((questionIndex + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.questionPrompt, { color: colors.foreground }]}>
              {currentQuestion.prompt}
            </Text>
            <View style={styles.answerList}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const answered = selectedAnswer !== null;
                const answerColor = answered && isCorrect
                  ? colors.primary
                  : answered && isSelected
                    ? colors.destructive
                    : colors.border;
                return (
                  <Pressable
                    key={`${questionIndex}-${option}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: answered }}
                    testID={`answer-${index}`}
                    disabled={answered}
                    onPress={() => answerQuestion(index)}
                    style={({ pressed }) => [
                      styles.answerOption,
                      {
                        backgroundColor: answered && (isCorrect || isSelected)
                          ? colors.secondary
                          : colors.card,
                        borderColor: answerColor,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.answerLetter, { color: colors.mutedForeground }]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                    <Text style={[styles.answerText, { color: colors.foreground }]}>
                      {option}
                    </Text>
                    {answered && isCorrect ? (
                      <Feather name="check-circle" size={18} color={colors.primary} />
                    ) : answered && isSelected ? (
                      <Feather name="x-circle" size={18} color={colors.destructive} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            {selectedAnswer !== null ? (
              <View style={[styles.feedback, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>
                  {selectedAnswer === currentQuestion.correctIndex
                    ? 'Bonne réponse'
                    : 'À retenir'}
                </Text>
                <Text style={[styles.feedbackText, { color: colors.mutedForeground }]}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            ) : null}
            <View style={styles.scoreLine}>
              <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
                Bonnes réponses
              </Text>
              <Text style={[styles.scoreValue, { color: colors.foreground }]}>
                {correctAnswers}
              </Text>
            </View>
            {selectedAnswer !== null ? (
              <Pressable
                accessibilityRole="button"
                testID="next-question"
                onPress={nextQuestion}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                  {questionIndex === questions.length - 1 ? 'Voir mon résultat' : 'Question suivante'}
                </Text>
                <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 22 },
  header: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    height: 42,
    width: 42,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  headerSpacer: { width: 42 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 31,
    lineHeight: 37,
    letterSpacing: -1.1,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  subjectList: { gap: 10, marginTop: 23 },
  subjectCard: {
    minHeight: 73,
    borderWidth: 1,
    borderRadius: 19,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  subjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectCopy: { flex: 1, gap: 4 },
  subjectTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  subjectDescription: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  rewardPreview: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    marginTop: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rewardText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16 },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
  },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  progressTrack: { height: 5, borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: 5, borderRadius: 4 },
  questionPrompt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.6,
    marginTop: 26,
    marginBottom: 18,
  },
  answerList: { gap: 9 },
  answerOption: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 11,
  },
  answerLetter: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    width: 20,
  },
  answerText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13 },
  feedback: { borderRadius: 15, padding: 12, marginTop: 13, gap: 4 },
  feedbackTitle: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  feedbackText: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  scoreLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  scoreLabel: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  scoreValue: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  resultArea: { flex: 1, justifyContent: 'center' },
  resultIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  resultTitle: { textAlign: 'center', marginTop: 18 },
  resultScore: {
    fontFamily: 'Inter_700Bold',
    fontSize: 54,
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: 18,
  },
  resultSubtitle: { textAlign: 'center', marginBottom: 25 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16, marginTop: 10 },
});

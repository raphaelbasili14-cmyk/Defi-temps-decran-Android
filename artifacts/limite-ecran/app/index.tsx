import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
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
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

const formatLimit = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} h`;
  return `${hours} h ${String(remaining).padStart(2, '0')}`;
};

const formatDate = () =>
  new Date()
    .toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .replace(/^\p{L}/u, (letter) => letter.toUpperCase());

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isReady, storageError } = useAppData();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const openChallenge = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/challenge');
  };

  const openQuiz = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/quiz');
  };

  const openSettings = () => {
    void Haptics.selectionAsync();
    router.push('/settings');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 14, paddingBottom: bottomInset + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
              <Feather name="activity" size={17} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              pause active
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les réglages"
            testID="open-settings"
            onPress={openSettings}
            style={({ pressed }) => [
              styles.iconButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="sliders" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate()}
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Ton temps,{'\n'}à ton rythme.
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Une limite claire. Une pause qui fait du bien.
        </Text>

        <View
          style={[
            styles.limitCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.limitCardTop}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
                TA LIMITE QUOTIDIENNE
              </Text>
              {isReady ? (
                <Text style={[styles.limitValue, { color: colors.foreground }]}>
                  {formatLimit(data.dailyLimitMinutes)}
                </Text>
              ) : (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loadingIndicator}
                />
              )}
            </View>
            <View style={[styles.limitIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="clock" size={20} color={colors.primary} />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.trackingRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
            <View style={styles.trackingCopy}>
              <Text style={[styles.trackingTitle, { color: colors.foreground }]}>
                Suivi Android à connecter
              </Text>
              <Text
                style={[
                  styles.trackingDescription,
                  { color: colors.mutedForeground },
                ]}
              >
                Le temps d’écran du téléphone n’est pas encore accessible dans cet aperçu.
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            testID="open-tracking-settings"
            onPress={openSettings}
            style={({ pressed }) => [
              styles.textAction,
              { opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Text style={[styles.textActionLabel, { color: colors.primary }]}>
              Comprendre le suivi
            </Text>
            <Feather name="arrow-up-right" size={15} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.bonusHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Tes minutes gagnées
          </Text>
          <Text style={[styles.bonusToday, { color: colors.mutedForeground }]}>
            aujourd’hui
          </Text>
        </View>

        <View
          style={[
            styles.bonusCard,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <View style={styles.bonusGlyph}>
            <Feather name="plus-circle" size={20} color={colors.primary} />
          </View>
          <View style={styles.bonusText}>
            <Text style={[styles.bonusValue, { color: colors.foreground }]}>
              {data.extraMinutesToday} min
            </Text>
            <Text style={[styles.bonusCaption, { color: colors.mutedForeground }]}>
              {data.challengesToday === 1
                ? '1 défi réalisé'
                : `${data.challengesToday} défi${data.challengesToday > 1 ? 's' : ''} réalisé${data.challengesToday > 1 ? 's' : ''}`}
            </Text>
          </View>
          <Text style={[styles.perChallenge, { color: colors.mutedForeground }]}>
            +{data.bonusMinutes} min / défi
          </Text>
        </View>

        <View style={styles.challengeHeading}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Choisis ton défi
          </Text>
        </View>

        <View
          style={[
            styles.challengeCard,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <View style={styles.challengeTop}>
            <View style={styles.challengeIcon}>
              <Feather name="activity" size={22} color={colors.primaryForeground} />
            </View>
            <View style={styles.bonusPill}>
              <Text style={[styles.bonusPillText, { color: colors.primaryForeground }]}>
                PHYSIQUE
              </Text>
            </View>
          </View>
          <Text style={[styles.challengeTitle, { color: colors.primaryForeground }]}>
            8 pompes.
          </Text>
          <Text
            style={[
              styles.challengeDescription,
              { color: colors.primaryForeground },
            ]}
          >
            Filme-toi avec la caméra avant. Le comptage fiable est en préparation.
          </Text>
          <Pressable
            accessibilityRole="button"
            testID="start-challenge"
            onPress={openChallenge}
            style={({ pressed }) => [
              styles.challengeButton,
              {
                backgroundColor: colors.primaryForeground,
                opacity: pressed ? 0.84 : 1,
              },
            ]}
          >
            <Text style={[styles.challengeButtonText, { color: colors.primary }]}>
              Voir le défi physique
            </Text>
            <Feather
              name="arrow-right"
              size={17}
              color={colors.primary}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.schoolCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.schoolIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="book-open" size={20} color={colors.primary} />
          </View>
          <View style={styles.schoolCopy}>
            <Text style={[styles.schoolTitle, { color: colors.foreground }]}>
              Défi scolaire
            </Text>
            <Text style={[styles.schoolDescription, { color: colors.mutedForeground }]}>
              Maths, français ou anglais
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir une matière"
            testID="start-school-quiz"
            onPress={openQuiz}
            style={({ pressed }) => [
              styles.schoolButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.84 : 1 },
            ]}
          >
            <Feather name="arrow-right" size={17} color={colors.primaryForeground} />
          </Pressable>
        </View>

        <Text style={[styles.challengeFootnote, { color: colors.mutedForeground }]}>
          Le quiz scolaire fonctionne hors connexion. Le bonus physique attendra le comptage automatique.
        </Text>

        {storageError ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {storageError}
          </Text>
        ) : null}
        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          La vidéo reste sur ton téléphone. Elle n’est pas envoyée.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22, gap: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: -0.4 },
  iconButton: {
    height: 42,
    width: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: { fontFamily: 'Inter_500Medium', fontSize: 13, marginBottom: 10 },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    lineHeight: 41,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 24,
  },
  limitCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 19,
  },
  limitCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 7,
  },
  limitValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 29,
    letterSpacing: -1,
  },
  loadingIndicator: { alignSelf: 'flex-start', marginTop: 12 },
  limitIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, marginVertical: 16 },
  trackingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  trackingCopy: { flex: 1, gap: 5 },
  trackingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  trackingDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
  },
  textAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  textActionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: -0.4 },
  bonusToday: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  bonusCard: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  bonusGlyph: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(215, 243, 106, 0.1)',
  },
  bonusText: { flex: 1, gap: 3 },
  bonusValue: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  bonusCaption: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  perChallenge: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  challengeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 12,
  },
  challengeCount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1,
  },
  challengeCard: { borderWidth: 1, borderRadius: 25, padding: 19 },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },
  challengeIcon: {
    height: 42,
    width: 42,
    borderRadius: 15,
    backgroundColor: 'rgba(23, 35, 27, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusPill: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: 'rgba(23, 35, 27, 0.12)',
  },
  bonusPillText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  challengeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 26,
    letterSpacing: -0.8,
  },
  challengeDescription: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.8,
    marginTop: 5,
    marginBottom: 18,
  },
  challengeButton: {
    borderRadius: 15,
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  challengeButtonText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  schoolCard: {
    borderWidth: 1,
    borderRadius: 20,
    minHeight: 78,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  schoolIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolCopy: { flex: 1, gap: 4 },
  schoolTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  schoolDescription: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  schoolButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeFootnote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 10,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },
  footerNote: {
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 17,
  },
});

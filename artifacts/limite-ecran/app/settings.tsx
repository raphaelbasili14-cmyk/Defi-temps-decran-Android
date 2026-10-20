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
import { useUsageStats } from '@/hooks/useUsageStats';
import * as IntentLauncher from 'expo-intent-launcher';

const formatLimit = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} h`;
  return `${hours} h ${String(remaining).padStart(2, '0')}`;
};

function Stepper({
  label,
  value,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
  testID,
}: {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled: boolean;
  incrementDisabled: boolean;
  testID: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.stepper}>
      <View style={styles.stepperCopy}>
        <Text style={[styles.stepperLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        <Text style={[styles.stepperValue, { color: colors.primary }]}>
          {value}
        </Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Diminuer ${label}`}
          testID={`${testID}-minus`}
          disabled={decrementDisabled}
          onPress={onDecrement}
          style={({ pressed }) => [
            styles.stepButton,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: decrementDisabled ? 0.35 : pressed ? 0.65 : 1,
            },
          ]}
        >
          <Feather name="minus" size={17} color={colors.foreground} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Augmenter ${label}`}
          testID={`${testID}-plus`}
          disabled={incrementDisabled}
          onPress={onIncrement}
          style={({ pressed }) => [
            styles.stepButton,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: incrementDisabled ? 0.35 : pressed ? 0.65 : 1,
            },
          ]}
        >
          <Feather name="plus" size={17} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    data,
    adjustDailyLimit,
    adjustBonusMinutes,
    storageError,
  } = useAppData();
  const usage = useUsageStats();
  const [usageActionError, setUsageActionError] = React.useState<string | null>(null);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const adjustWithHaptics = (action: () => Promise<void>) => {
    void Haptics.selectionAsync();
    void action();
  };

  const requestUsageAccess = async () => {
    if (Platform.OS !== 'android') return;
    setUsageActionError(null);
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.USAGE_ACCESS_SETTINGS,
      );
      await usage.refresh();
    } catch {
      setUsageActionError(
        'Impossible d’ouvrir ce réglage. Ouvre manuellement les paramètres d’accès spécial Android.',
      );
    }
  };

  const usageAccessTitle =
    usage.status === 'ready'
      ? 'Accès aux données d’utilisation activé'
      : usage.status === 'permission-required'
        ? 'Accès aux données d’utilisation à autoriser'
        : usage.status === 'unsupported'
          ? 'Installation Android autonome nécessaire'
          : usage.status === 'error'
            ? 'Statistiques indisponibles'
            : 'Vérification de l’autorisation…';

  const usageAccessDescription =
    usage.status === 'ready' && usage.todaySeconds !== null
      ? `Suivi actif sur cet appareil · ${Math.floor(usage.todaySeconds / 60)} min aujourd’hui`
      : usage.status === 'permission-required'
        ? 'Dans les réglages Android, autorise Pause Active à accéder aux données d’utilisation, puis reviens ici.'
        : usage.status === 'unsupported'
          ? 'L’aperçu Expo Go n’a pas son propre profil d’application. Installe un APK Pause Active pour accorder cette autorisation.'
          : usage.error ?? 'Les statistiques sont lues localement sur le téléphone.';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 12, paddingBottom: bottomInset + 26 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            testID="settings-back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Réglages
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Tes règles,{'\n'}tes choix.
        </Text>
        <Text style={[styles.pageIntro, { color: colors.mutedForeground }]}>
          Commence avec une limite qui te semble tenable. Tu pourras l’ajuster à tout moment.
        </Text>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            LIMITES & BONUS
          </Text>
          <Stepper
            label="Limite quotidienne"
            value={formatLimit(data.dailyLimitMinutes)}
            onDecrement={() => adjustWithHaptics(() => adjustDailyLimit(-15))}
            onIncrement={() => adjustWithHaptics(() => adjustDailyLimit(15))}
            decrementDisabled={data.dailyLimitMinutes <= 30}
            incrementDisabled={data.dailyLimitMinutes >= 600}
            testID="daily-limit"
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Stepper
            label="Bonus par défi"
            value={`${data.bonusMinutes} min`}
            onDecrement={() => adjustWithHaptics(() => adjustBonusMinutes(-5))}
            onIncrement={() => adjustWithHaptics(() => adjustBonusMinutes(5))}
            decrementDisabled={data.bonusMinutes <= 5}
            incrementDisabled={data.bonusMinutes >= 30}
            testID="bonus-minutes"
          />
          <Text style={[styles.smallHelp, { color: colors.mutedForeground }]}>
            La limite peut être réglée de 30 min à 10 h. Le bonus va de 5 à 30 min.
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <View style={[styles.infoIcon, { backgroundColor: colors.card }]}>
            <Feather name="smartphone" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>
            À propos du suivi Android
          </Text>
          <Text style={[styles.infoBody, { color: colors.mutedForeground }]}>
            Android identifie l’application sous le nom de paquet ci-dessous. Après installation de l’APK, tu pourras activer l’autorisation spéciale « Accès aux données d’utilisation ». Les statistiques seront lues sur l’appareil et ne seront pas envoyées.
          </Text>
          <View style={[styles.stepsBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.stepsTitle, { color: colors.foreground }]}>
              Identité Android
            </Text>
            <Text style={[styles.stepsText, { color: colors.mutedForeground }]}>
              com.pauseactive.mobile
            </Text>
          </View>
          <View
            style={[
              styles.usageStatus,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {usage.status === 'checking' ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Feather
                name={usage.status === 'ready' ? 'check-circle' : 'info'}
                size={17}
                color={usage.status === 'ready' ? colors.primary : colors.accent}
              />
            )}
            <View style={styles.usageStatusCopy}>
              <Text style={[styles.usageStatusTitle, { color: colors.foreground }]}>
                {usageAccessTitle}
              </Text>
              <Text style={[styles.usageStatusBody, { color: colors.mutedForeground }]}>
                {usageAccessDescription}
              </Text>
            </View>
          </View>
          {usage.status === 'permission-required' && Platform.OS === 'android' ? (
            <Pressable
              accessibilityRole="button"
              testID="grant-usage-access"
              onPress={() => void requestUsageAccess()}
              style={({ pressed }) => [
                styles.permissionButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.permissionButtonText, { color: colors.primaryForeground }]}>
                Ouvrir les réglages Android
              </Text>
              <Feather name="arrow-up-right" size={15} color={colors.primaryForeground} />
            </Pressable>
          ) : null}
          {usageActionError ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {usageActionError}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.privacyCard,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Feather name="shield" size={17} color={colors.primary} />
          <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
            Tes réglages sont stockés sur cet appareil. Les vidéos de défi ne sont pas envoyées.
          </Text>
        </View>

        {storageError ? (
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {storageError}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 22 },
  header: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
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
  pageTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.3,
  },
  pageIntro: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 24,
  },
  sectionCard: { borderWidth: 1, borderRadius: 23, padding: 18 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1 },
  stepper: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  stepperCopy: { flex: 1, gap: 5 },
  stepperLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  stepperValue: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1 },
  smallHelp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
  },
  infoCard: { borderWidth: 1, borderRadius: 23, padding: 18, marginTop: 16 },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  infoTitle: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  infoBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  stepsBox: { borderRadius: 15, padding: 13, marginTop: 14 },
  stepsTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginBottom: 5 },
  stepsText: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 16 },
  usageStatus: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  usageStatusCopy: { flex: 1, gap: 4 },
  usageStatusTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  usageStatusBody: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15 },
  permissionButton: {
    minHeight: 43,
    borderRadius: 13,
    paddingHorizontal: 13,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionButtonText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  privacyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  privacyText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, marginTop: 14 },
});

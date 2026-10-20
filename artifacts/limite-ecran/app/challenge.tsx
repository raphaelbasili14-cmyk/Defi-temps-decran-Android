import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { VideoView, useVideoPlayer } from 'expo-video';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '@/context/AppDataContext';
import { useColors } from '@/hooks/useColors';

function RecordedVideo({ uri }: { uri: string }) {
  const colors = useColors();
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  return (
    <View style={[styles.videoReview, { backgroundColor: colors.card }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
      />
      <Text style={[styles.videoCaption, { color: colors.mutedForeground }]}>
        Regarde la vidéo avant de confirmer ton effort.
      </Text>
    </View>
  );
}

export default function ChallengeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [clipUri, setClipUri] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { data, addChallengeBonus } = useAppData();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    setCameraError(null);
    setClipUri(null);
    setSeconds(0);
    const camera = cameraRef.current;
    if (!camera) {
      setCameraError('La caméra n’est pas encore prête. Réessaie dans un instant.');
      return;
    }
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsRecording(true);
      const recording = await camera.recordAsync({ maxDuration: 90 });
      if (recording?.uri) setClipUri(recording.uri);
    } catch {
      setCameraError('La vidéo n’a pas pu être enregistrée. Vérifie les autorisations de la caméra.');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  const confirmChallenge = () => {
    Alert.alert(
      'Confirmer le défi',
      `As-tu réalisé les 8 pompes et vérifié la vidéo ? Le bonus de ${data.bonusMinutes} minutes sera ajouté à ton compteur.`,
      [
        { text: 'Pas encore', style: 'cancel' },
        {
          text: 'Oui, confirmer',
          onPress: () => {
            setIsSaving(true);
            void addChallengeBonus()
              .then(() => {
                void Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                Alert.alert(
                  'Bien joué !',
                  `${data.bonusMinutes} minutes ont été ajoutées à tes bonus du jour.`,
                  [{ text: 'Continuer', onPress: () => router.replace('/') }],
                );
              })
              .finally(() => setIsSaving(false));
          },
        },
      ],
    );
  };

  const openSettings = async () => {
    if (Platform.OS === 'web') return;
    try {
      await Linking.openSettings();
    } catch {
      setCameraError('Ouvre les réglages du téléphone pour autoriser la caméra.');
    }
  };

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const showCamera = Platform.OS !== 'web' && permission?.granted && !clipUri;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingTop: topInset + 10, paddingBottom: bottomInset + 18 }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            testID="challenge-back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Défi du jour
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heading}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            8 POMPES · +{data.bonusMinutes} MIN
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            À toi de jouer.
          </Text>
          <Text style={[styles.instructions, { color: colors.mutedForeground }]}>
            Pose ton téléphone de côté, en plan large. Filme tes pompes, puis regarde la vidéo avant de confirmer.
          </Text>
        </View>

        <View
          style={[
            styles.cameraFrame,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {showCamera ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              mode="video"
              mute
              onMountError={(event) => setCameraError(event.message)}
            />
          ) : clipUri ? (
            <RecordedVideo uri={clipUri} />
          ) : permission?.granted && Platform.OS === 'web' ? (
            <View style={styles.permissionPanel}>
              <Feather name="camera" size={26} color={colors.primary} />
              <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
                La caméra est disponible sur Android
              </Text>
              <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
                Ouvre l’aperçu sur un téléphone pour filmer ton défi.
              </Text>
            </View>
          ) : !permission ? (
            <View style={styles.permissionPanel}>
              <Feather name="loader" size={24} color={colors.primary} />
              <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
                Vérification de l’autorisation caméra…
              </Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionPanel}>
              <View style={[styles.cameraIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="camera" size={23} color={colors.primary} />
              </View>
              <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
                La caméra est nécessaire
              </Text>
              <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
                La vidéo est enregistrée sur ton appareil et n’est pas envoyée.
              </Text>
              {permission.status === 'denied' && !permission.canAskAgain ? (
                <Pressable
                  accessibilityRole="button"
                  testID="open-camera-settings"
                  onPress={() => void openSettings()}
                  style={({ pressed }) => [
                    styles.smallButton,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.smallButtonText, { color: colors.primaryForeground }]}>
                    Ouvrir les réglages
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  testID="request-camera"
                  onPress={() => void requestPermission()}
                  style={({ pressed }) => [
                    styles.smallButton,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[styles.smallButtonText, { color: colors.primaryForeground }]}>
                    Autoriser la caméra
                  </Text>
                </Pressable>
              )}
            </View>
          ) : null}
          {isRecording ? (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC {formattedTime}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomContent}>
          {cameraError ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {cameraError}
            </Text>
          ) : null}
          {clipUri ? (
            <>
              <View style={[styles.disclosure, { backgroundColor: colors.secondary }]}>
                <Feather name="eye" size={15} color={colors.primary} />
                <Text style={[styles.disclosureText, { color: colors.mutedForeground }]}>
                  La vidéo est une preuve à vérifier par toi. Aucun comptage automatique n’est effectué.
                </Text>
              </View>
              <View style={styles.actionRow}>
                <Pressable
                  accessibilityRole="button"
                  testID="record-again"
                  onPress={() => setClipUri(null)}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Feather name="rotate-ccw" size={16} color={colors.foreground} />
                  <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
                    Refaire
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  testID="confirm-challenge"
                  disabled={isSaving}
                  onPress={confirmChallenge}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: isSaving ? 0.5 : pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                    J’ai fait mes 8 pompes
                  </Text>
                  <Feather name="check" size={17} color={colors.primaryForeground} />
                </Pressable>
              </View>
            </>
          ) : permission?.granted && Platform.OS !== 'web' ? (
            <Pressable
              accessibilityRole="button"
              testID={isRecording ? 'stop-recording' : 'start-recording'}
              onPress={isRecording ? stopRecording : () => void startRecording()}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: isRecording ? colors.destructive : colors.primary,
                  opacity: pressed ? 0.83 : 1,
                },
              ]}
            >
              <Feather
                name={isRecording ? 'square' : 'video'}
                size={17}
                color={isRecording ? colors.destructiveForeground : colors.primaryForeground}
              />
              <Text
                style={[
                  styles.primaryButtonText,
                  {
                    color: isRecording
                      ? colors.destructiveForeground
                      : colors.primaryForeground,
                  },
                ]}
              >
                {isRecording ? 'Terminer la vidéo' : 'Commencer à filmer'}
              </Text>
            </Pressable>
          ) : null}
          <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
            Vidéo conservée localement pendant la session. Pas d’envoi, pas d’analyse automatique.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  header: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  heading: { marginTop: 22, marginBottom: 18 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1 },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 31,
    letterSpacing: -1.1,
    marginTop: 8,
  },
  instructions: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  cameraFrame: {
    flex: 1,
    minHeight: 250,
    maxHeight: 420,
    borderWidth: 1,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  camera: { flex: 1 },
  permissionPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 9,
  },
  cameraIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  permissionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, textAlign: 'center' },
  permissionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  smallButton: { borderRadius: 14, paddingVertical: 11, paddingHorizontal: 15, marginTop: 5 },
  smallButtonText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  recordingBadge: {
    position: 'absolute',
    top: 13,
    left: 13,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 30, 25, 0.86)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  recordingDot: { height: 7, width: 7, borderRadius: 4, backgroundColor: '#E87668' },
  recordingText: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.7 },
  videoReview: { flex: 1, padding: 10, justifyContent: 'center' },
  video: { flex: 1, borderRadius: 16 },
  videoCaption: { fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'center', paddingTop: 8 },
  bottomContent: { gap: 12, paddingTop: 16 },
  disclosure: {
    borderRadius: 14,
    padding: 11,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  disclosureText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15 },
  actionRow: { flexDirection: 'row', gap: 9 },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  secondaryButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 16 },
  privacyNote: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 14, textAlign: 'center' },
});

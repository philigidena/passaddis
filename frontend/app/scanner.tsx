/**
 * QR Scanner Screen
 * For organizers to validate tickets at event entry
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ticketsApi } from '@/services/api';

interface ValidationResult {
  valid: boolean;
  message: string;
  ticket?: {
    id: string;
    event: string;
    ticketType: string;
    attendee: string;
  };
  usedAt?: string;
}

export default function ScannerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated } = useAuth();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Check if user is organizer or admin
  const canScan = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/signin');
    }
  }, [isAuthenticated]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isValidating) return;

    setScanned(true);
    setIsValidating(true);
    Vibration.vibrate(100);

    try {
      const response = await ticketsApi.validate(data);
      if (response.data) {
        setResult(response.data as ValidationResult);
      } else {
        setResult({
          valid: false,
          message: response.error || 'Failed to validate ticket',
        });
      }
    } catch (error) {
      setResult({
        valid: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setIsValidating(false);
      setShowResult(true);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setResult(null);
    setShowResult(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!canScan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ticket Scanner</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.notAllowedContainer}>
          <View style={[styles.notAllowedIcon, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="lock-closed-outline" size={48} color={theme.icon} />
          </View>
          <Text style={[styles.notAllowedTitle, { color: theme.text }]}>Access Restricted</Text>
          <Text style={[styles.notAllowedText, { color: theme.textSecondary }]}>
            Only event organizers can scan tickets. If you're an organizer, please contact support to upgrade your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ticket Scanner</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionContainer}>
          <View style={[styles.permissionIcon, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="camera-outline" size={48} color={theme.icon} />
          </View>
          <Text style={[styles.permissionTitle, { color: theme.text }]}>Camera Permission Required</Text>
          <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
            We need camera access to scan ticket QR codes
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#FFFFFF' }]}>Ticket Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Scan Overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.scanInstruction}>
              {isValidating ? 'Validating...' : 'Position QR code within the frame'}
            </Text>
          </View>
        </View>
      </View>

      {/* Result Modal */}
      <Modal
        visible={showResult}
        animationType="slide"
        transparent
        onRequestClose={handleScanAgain}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {result && (
              <>
                <View style={[
                  styles.resultIcon,
                  { backgroundColor: result.valid ? '#10B98120' : '#EF444420' }
                ]}>
                  <Ionicons
                    name={result.valid ? 'checkmark-circle' : 'close-circle'}
                    size={64}
                    color={result.valid ? '#10B981' : '#EF4444'}
                  />
                </View>

                <Text style={[
                  styles.resultTitle,
                  { color: result.valid ? '#10B981' : '#EF4444' }
                ]}>
                  {result.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                </Text>

                <Text style={[styles.resultMessage, { color: theme.textSecondary }]}>
                  {result.message}
                </Text>

                {result.valid && result.ticket && (
                  <View style={[styles.ticketDetails, { backgroundColor: theme.backgroundSecondary }]}>
                    <View style={styles.ticketDetailRow}>
                      <Text style={[styles.ticketDetailLabel, { color: theme.textSecondary }]}>Event</Text>
                      <Text style={[styles.ticketDetailValue, { color: theme.text }]}>{result.ticket.event}</Text>
                    </View>
                    <View style={styles.ticketDetailRow}>
                      <Text style={[styles.ticketDetailLabel, { color: theme.textSecondary }]}>Type</Text>
                      <Text style={[styles.ticketDetailValue, { color: theme.text }]}>{result.ticket.ticketType}</Text>
                    </View>
                    <View style={styles.ticketDetailRow}>
                      <Text style={[styles.ticketDetailLabel, { color: theme.textSecondary }]}>Attendee</Text>
                      <Text style={[styles.ticketDetailValue, { color: theme.text }]}>{result.ticket.attendee}</Text>
                    </View>
                  </View>
                )}

                {!result.valid && result.usedAt && (
                  <Text style={[styles.usedAtText, { color: theme.textSecondary }]}>
                    Already used on {new Date(result.usedAt).toLocaleString()}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.scanAgainButton, { backgroundColor: theme.primary }]}
                  onPress={handleScanAgain}
                >
                  <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.scanAgainButtonText}>Scan Another</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 40,
  },
  scanInstruction: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  notAllowedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAllowedIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notAllowedTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  notAllowedText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  ticketDetails: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketDetailLabel: {
    fontSize: 14,
  },
  ticketDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  usedAtText: {
    fontSize: 14,
    marginBottom: 24,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  scanAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

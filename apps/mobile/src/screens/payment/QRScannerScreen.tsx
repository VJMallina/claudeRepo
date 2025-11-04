import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, typography } from '@/theme/theme';

type QRScannerScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function QRScannerScreen({ navigation }: QRScannerScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);

    // Parse UPI QR code
    const upiData = parseUpiQrCode(data);

    if (upiData) {
      // Navigate to payment confirmation screen
      navigation.navigate('PaymentConfirmation', {
        merchantUpiId: upiData.pa,
        merchantName: upiData.pn || 'Merchant',
        amount: upiData.am || null,
      });
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This is not a valid UPI QR code. Please scan a merchant QR code.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const parseUpiQrCode = (data: string) => {
    try {
      // UPI QR codes typically follow this format:
      // upi://pay?pa=merchant@upi&pn=MerchantName&am=100&cu=INR

      if (!data.startsWith('upi://pay')) {
        return null;
      }

      const url = new URL(data);
      const params = new URLSearchParams(url.search);

      const pa = params.get('pa'); // Payee address (merchant UPI ID)
      const pn = params.get('pn'); // Payee name
      const am = params.get('am'); // Amount
      const cu = params.get('cu'); // Currency

      if (!pa) {
        return null;
      }

      return {
        pa,
        pn,
        am: am ? parseFloat(am) : null,
        cu: cu || 'INR',
      };
    } catch (error) {
      return null;
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.text}>
          Please grant camera permission to scan QR codes for payments.
        </Text>
        <Button mode="contained" onPress={requestCameraPermission} style={styles.button}>
          Grant Permission
        </Button>
        <Button mode="text" onPress={() => navigation.goBack()} style={styles.button}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Align QR code within the frame
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              textColor="#FFFFFF"
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const SCAN_AREA_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#6200EE',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  instructionText: {
    ...typography.body1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
  title: {
    ...typography.h2,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body1,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});

import { Ionicons } from '@expo/vector-icons';
import React, { ErrorInfo, PropsWithChildren } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type State = {
  error?: Error;
  incidentId?: string;
};

function createIncidentId() {
  return `TT-${Date.now().toString(36).toUpperCase()}`;
}

export class AppErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error, incidentId: createIncidentId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('TableTime unrecoverable render error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      incidentId: this.state.incidentId,
    });
  }

  private retry = () => {
    this.setState({ error: undefined, incidentId: undefined });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View accessibilityRole="alert" style={styles.card}>
          <View style={styles.icon}>
            <Ionicons name="warning-outline" size={30} color={colors.orange} />
          </View>
          <Text style={styles.eyebrow}>RECOVERY MODE</Text>
          <Text style={styles.title}>TableTime needs a fresh start</Text>
          <Text style={styles.copy}>Your saved restaurant data was not changed. Try loading the app again; if the problem repeats, share the incident code with support.</Text>
          <Text selectable style={styles.incident}>Incident {this.state.incidentId}</Text>
          <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 480, padding: 28, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  icon: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { marginTop: 18, color: colors.orange, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { marginTop: 8, color: colors.ink, fontSize: 24, lineHeight: 30, fontWeight: '900', textAlign: 'center' },
  copy: { marginTop: 10, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  incident: { marginTop: 15, color: colors.ink, fontSize: 11, fontWeight: '800' },
  button: { minHeight: 44, marginTop: 20, paddingHorizontal: 22, borderRadius: 11, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.surface, fontSize: 13, fontWeight: '900' },
});

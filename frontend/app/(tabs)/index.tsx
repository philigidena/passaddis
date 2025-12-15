import React from 'react';
import { StyleSheet, ScrollView, View, StatusBar, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';
import { NavBar } from '@/components/NavBar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { FeaturedEvents } from '@/components/FeaturedEvents';
import { ShopPreview } from '@/components/ShopPreview';
import { TrustSection } from '@/components/TrustSection';
import { Footer } from '@/components/Footer';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Fixed Navigation */}
      <NavBar transparent />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <Hero />

        {/* How It Works - 3 Step Flow */}
        <HowItWorks />

        {/* Featured Events */}
        <FeaturedEvents />

        {/* Curated Shop Preview */}
        <ShopPreview />

        {/* Trust & Payment Security */}
        <TrustSection />

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

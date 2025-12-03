import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '../utils/haptics';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: 'videocam',
    title: 'Record Hot Takes',
    description: 'Share your unfiltered reactions to the game in real-time. Your voice, your perspective.',
    color: '#00FF9F',
  },
  {
    icon: 'people',
    title: 'Follow Your Favorites',
    description: 'Connect with fellow fans, athletes, and sports personalities. Build your sports community.',
    color: '#00A8E8',
  },
  {
    icon: 'trending-up',
    title: 'Track the Action',
    description: 'Stay updated with live odds, game scores, and trending takes from across the league.',
    color: '#FFB800',
  },
  {
    icon: 'chatbubbles',
    title: 'Join the Conversation',
    description: 'React, comment, and debate with fans worldwide. Your take could go viral.',
    color: '#FF1493',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const swiperRef = useRef<Swiper>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGetStarted = async () => {
    try {
      haptics.success();
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      (navigation as any).replace('SignIn');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleNext = () => {
    haptics.light();
    if (currentIndex < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    haptics.light();
    handleGetStarted();
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View style={styles.slide} key={index}>
      <View style={[styles.iconContainer, { backgroundColor: `${slide.color}20` }]}>
        <Ionicons name={slide.icon} size={80} color={slide.color} />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={styles.pagination}
        onIndexChanged={setCurrentIndex}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </Swiper>

      {/* Next/Get Started Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color="#0A0E27" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#8892A6',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    bottom: 120,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A4166',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF9F',
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00FF9F',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
});


import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Play, Zap, CheckCircle, AlertCircle, BookOpen, Sparkles, Clock, Star, Scroll, Lightbulb, Crown, Flame, Timer, TrendingUp, Eye } from 'lucide-react-native';
import { Research } from '@/types/game';
import colors from '@/constants/colors';
import { useGameStore } from '@/hooks/useGameStore';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function LibraryScreen() {
  const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const scrollViewRef = useRef<ScrollView>(null);
  
  const router = useRouter();
  const { 
    activeCharacter, 
    activeResearch, 
    completedResearch,
    diamonds,
    getAvailableResearch,
    startResearch,
    completeResearch,
    skipResearchWithDiamonds
  } = useGameStore();
  
  // Update current time every second for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-complete research when timer expires
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeResearch.forEach(research => {
        if (research.completedAt && now >= research.completedAt) {
          const success = completeResearch(research.id);
          if (success) {
            Alert.alert('Research Completed', `${research.name} has been completed!`);
          }
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeResearch, completeResearch]);
  
  if (!activeCharacter) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No character selected</Text>
      </View>
    );
  }
  
  const availableResearch = getAvailableResearch();
  
  const handleStartResearch = (research: Research) => {
    setIsStarting(true);
    setStartError(null);
    setSelectedResearch(research);
    
    Alert.alert(
      'Begin Research Journey',
      `Embark on the study of ${research.name}? This scholarly pursuit will require ${Math.floor(research.duration / 60 / 1000)} minutes of dedicated research and contemplation.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {
          setIsStarting(false);
          setSelectedResearch(null);
        }},
        { 
          text: 'Begin Study', 
          onPress: () => {
            const success = startResearch(research.id);
            if (success) {
              Alert.alert('Research Commenced!', `Your journey into ${research.name} has begun. May knowledge illuminate your path.`);
              // Scroll to active research section
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ y: 200, animated: true });
                }
              }, 500);
            } else {
              setStartError(`Unable to commence research. Please verify all requirements are met.`);
              setTimeout(() => setStartError(null), 3000);
            }
            setIsStarting(false);
            setSelectedResearch(null);
          }
        }
      ]
    );
  };
  
  const handleSkipResearch = (research: Research) => {
    const timeRemaining = research.completedAt! - Date.now();
    const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
    const diamondCost = Math.max(1, Math.floor(minutesRemaining / 2)); // 1 diamond per 2 minutes
    
    Alert.alert(
      'Accelerate Research',
      `Channel mystical energy to complete the remaining ${minutesRemaining} minutes instantly for ${diamondCost} diamonds?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Channel Energy', 
          onPress: () => {
            const success = skipResearchWithDiamonds(research.id);
            if (success) {
              Alert.alert('Research Accelerated!', `${research.name} has been completed through mystical acceleration!`);
            } else {
              Alert.alert('Insufficient Energy', `You need ${diamondCost} diamonds to accelerate this research.`);
            }
          }
        }
      ]
    );
  };
  
  const formatTimeRemaining = (completedAt: number) => {
    const timeRemaining = Math.max(0, completedAt - currentTime);
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return {
        display: `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        urgency: 'normal',
        totalSeconds: Math.floor(timeRemaining / 1000)
      };
    }
    
    const urgency = minutes < 5 ? 'urgent' : minutes < 15 ? 'moderate' : 'normal';
    return {
      display: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      urgency,
      totalSeconds: Math.floor(timeRemaining / 1000)
    };
  };
  
  const getProgressPercentage = (research: Research) => {
    if (!research.startedAt || !research.completedAt) return 0;
    const now = currentTime;
    const totalDuration = research.completedAt - research.startedAt;
    const elapsed = now - research.startedAt;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat':
        return colors.error;
      case 'magic':
        return colors.primary;
      case 'crafting':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat':
        return '⚔️';
      case 'magic':
        return '✨';
      case 'crafting':
        return '🔨';
      default:
        return '📚';
    }
  };

  const getResearchPhase = (progress: number) => {
    if (progress < 5) return 'initiation';
    if (progress < 15) return 'foundation';
    if (progress < 30) return 'exploration';
    if (progress < 50) return 'discovery';
    if (progress < 70) return 'understanding';
    if (progress < 85) return 'synthesis';
    if (progress < 95) return 'mastery';
    if (progress < 100) return 'transcendence';
    return 'enlightenment';
  };

  const getResearchNarration = (research: Research, progress: number) => {
    const phase = getResearchPhase(progress);
    const category = research.category;
    
    const narrations = {
      combat: {
        initiation: `You carefully unfurl the ancient scrolls containing the secrets of ${research.name}. The parchment crackles with age, and you can almost feel the weight of countless warriors who have studied these same techniques. Your fingers trace the intricate diagrams of combat stances, each line telling a story of battles won and lost. The air seems to thicken with anticipation as you begin your journey into the martial arts.`,
        
        foundation: `As you delve deeper into the fundamental principles, the basic forms begin to make sense. Your muscles start to remember the movements, even as you sit in study. The text speaks of balance - not just physical, but mental and spiritual. You find yourself unconsciously shifting your posture, adopting the stance of a warrior even while reading. The foundation stones of mastery are being laid, one careful study session at a time.`,
        
        exploration: `The intermediate techniques reveal themselves like layers of an onion being peeled away. You begin to see how master craftsmen think - not just about the final product, but about the entire process of creation. You understand now how ${research.name} requires not just skill, but intuition, not just knowledge, but wisdom. Your hands begin to move with increasing confidence, guided by principles that are becoming second nature.`,
        
        discovery: `A breakthrough moment arrives like lightning! The deeper secrets of ${research.name} suddenly become clear - you see how the greatest masters could create works that seemed to possess souls of their own. The mechanical becomes artistic, the functional becomes beautiful. You understand now that true craftsmanship is a form of magic in its own right.`,
        
        understanding: `The advanced techniques of ${research.name} flow through your hands like water finding its course. You begin to see how every aspect of the craft connects to every other, how the entire system forms a perfect whole. Your creations begin to show a level of quality that surprises even you. The line between craftsman and artist begins to blur.`,
        
        synthesis: `You find yourself innovating, developing new techniques and approaches that improve upon the traditional methods of ${research.name}. Your understanding has become so complete that you can adapt to any material, solve any creative challenge. You are no longer just following the patterns of the past - you are creating the templates for the future.`,
        
        mastery: `The techniques of ${research.name} have become extensions of your very being. Your hands know what to do before your mind has finished forming the thought. You have achieved a level of skill that allows you to teach others, to pass on not just the techniques but the deeper understanding that makes true mastery possible. Your workshop has become a place of pilgrimage for aspiring craftsmen.`,
        
        transcendence: `You stand at the threshold of legendary craftsmanship. Your mastery of ${research.name} has reached a level where your creations are sought after by kings and heroes. Every piece you create is a masterwork, every technique you employ is flawless. You have become a living embodiment of the craft itself.`,
        
        enlightenment: `Ultimate mastery achieved. You have become one with the art of ${research.name}. Your creations transcend mere objects - they become expressions of pure artistic and technical perfection. You understand now what the legendary masters meant when they spoke of breathing life into their work. You have achieved immortality through craft.`
      },
      
      magic: {
        initiation: `The mystical tome of ${research.name} opens before you with an almost audible whisper of ancient power. The pages seem to shimmer with their own inner light, and the arcane symbols dance before your eyes as if alive. You can feel the raw magical energy contained within these words, waiting to be understood and channeled. Your first tentative attempts to comprehend the fundamental principles send small sparks of energy through your fingertips.`,
        
        foundation: `The basic magical theories begin to crystallize in your mind like frost forming on a window. You start to understand the fundamental forces that govern ${research.name} - how magical energy flows through the world, how will and intention can shape reality itself. Your practice sessions fill the air with subtle magical emanations, and you notice that candles flicker when you concentrate, that shadows seem to respond to your thoughts.`,
        
        exploration: `As you delve into the intermediate principles, the very fabric of reality seems more malleable in your presence. You begin to sense the magical currents that flow through all things, the invisible threads that connect mind to matter, intention to manifestation. Your understanding of ${research.name} expands beyond mere spell-casting into a deeper comprehension of the cosmic forces at play.`,
        
        discovery: `A moment of pure magical revelation strikes you like lightning from a clear sky! The deeper mysteries of ${research.name} suddenly unfold in your consciousness. You see now how the ancient mages could reshape reality with a thought, how they could bend the very laws of nature to their will. The theoretical becomes practical, the impossible becomes inevitable. Magic is no longer something you do - it is something you are.`,
        
        understanding: `The advanced magical principles flow through your mind like a river of liquid starlight. You begin to see the connections between all schools of magic, how ${research.name} fits into the greater tapestry of arcane knowledge. Your spells become more than mere formulas - they become expressions of your will made manifest. The boundary between caster and magic begins to dissolve.`,
        
        synthesis: `You find yourself innovating, creating new applications of ${research.name} that the original texts never imagined. Your understanding has become so complete that you can adapt the principles to any situation, solve any magical problem. You are no longer bound by the limitations of traditional spell-casting - you have begun to write your own chapter in the great book of magic.`,
        
        mastery: `The magical energies of ${research.name} respond to your will as naturally as your own heartbeat. You have achieved a level of understanding that allows you to teach others, to guide them through the same journey of discovery you have completed. The arcane mysteries that once seemed impossible now feel like old friends. You stand among the ranks of the truly accomplished mages.`,
        
        transcendence: `You approach the pinnacle of magical understanding. The principles of ${research.name} have become so integrated into your being that you could perform its greatest feats in your sleep. Your magical aura has grown so powerful that other mages can sense your presence from great distances. You are becoming a living conduit for the forces you have studied.`,
        
        enlightenment: `Ultimate magical mastery achieved. You have become one with the cosmic forces that govern ${research.name}. Magic flows through you like breath, like blood, like thought itself. You understand now what the archmages meant when they spoke of becoming magic rather than merely using it. You have transcended the mortal limitations of spell-casting and touched the infinite.`
      },
      
      crafting: {
        initiation: `You spread the intricate blueprints and schematics of ${research.name} across your study table, each line and measurement a testament to generations of master craftsmen. The diagrams seem to pulse with their own inner logic, revealing the deep principles that govern the creation of truly exceptional works. Your hands trace the patterns, and you can almost feel the tools responding to your touch, eager to begin the work.`,
        
        foundation: `The fundamental principles of ${research.name} begin to make sense as you study the relationship between form and function, between material and purpose. You start to understand why certain techniques evolved, how each tool serves its specific role in the greater symphony of creation. Your practice pieces, though simple, show a growing understanding of the craft's deeper principles.`,
        
        exploration: `As you delve into the intermediate techniques, you begin to see how master craftsmen think - not just about the final product, but about the entire process of creation. You understand now how ${research.name} requires not just skill, but intuition, not just knowledge, but wisdom. Your hands begin to move with increasing confidence, guided by principles that are becoming second nature.`,
        
        discovery: `A moment of pure creative insight illuminates your understanding! The deeper secrets of ${research.name} suddenly become clear - you see how the greatest masters could create works that seemed to possess souls of their own. The mechanical becomes artistic, the functional becomes beautiful. You understand now that true craftsmanship is a form of magic in its own right.`,
        
        understanding: `The advanced techniques of ${research.name} flow through your hands like water finding its course. You begin to see how every aspect of the craft connects to every other, how the entire system forms a perfect whole. Your creations begin to show a level of quality that surprises even you. The line between craftsman and artist begins to blur.`,
        
        synthesis: `You find yourself innovating, developing new techniques and approaches that improve upon the traditional methods of ${research.name}. Your understanding has become so complete that you can adapt to any material, solve any creative challenge. You are no longer just following the patterns of the past - you are creating the templates for the future.`,
        
        mastery: `The techniques of ${research.name} have become extensions of your very being. Your hands know what to do before your mind has finished forming the thought. You have achieved a level of skill that allows you to teach others, to pass on not just the techniques but the deeper understanding that makes true mastery possible. Your workshop has become a place of pilgrimage for aspiring craftsmen.`,
        
        transcendence: `You stand at the threshold of legendary craftsmanship. Your mastery of ${research.name} has reached a level where your creations are sought after by kings and heroes. Every piece you create is a masterwork, every technique you employ is flawless. You have become a living embodiment of the craft itself.`,
        
        enlightenment: `Ultimate mastery achieved. You have become one with the art of ${research.name}. Your creations transcend mere objects - they become expressions of pure artistic and technical perfection. You understand now what the legendary masters meant when they spoke of breathing life into their work. You have achieved immortality through craft.`
      }
    };
    
    return narrations[category as keyof typeof narrations]?.[phase] || 
           `Your dedicated study of ${research.name} continues to deepen your understanding of its mysteries. Each moment brings new insights and revelations.`;
  };

  const getMockKnowledge = (research: Research, progress: number) => {
    const phase = getResearchPhase(progress);
    const category = research.category;
    
    const knowledge = {
      combat: {
        initiation: `📜 Historical Chronicle: The techniques recorded in ${research.name} were first developed during the legendary War of the Crimson Dawn, when conventional warfare proved insufficient against the demonic hordes that poured forth from the Shadowlands. Master Korven the Undefeated, founder of the Iron Circle, spent seven years perfecting these forms while besieged in the fortress of Ironhold.`,
        
        foundation: `⚔️ Tactical Insight: Ancient military texts reveal that practitioners of ${research.name} could turn the tide of entire battles. The technique emphasizes not just physical prowess, but psychological warfare - the mere sight of a master assuming the opening stance was often enough to cause enemy formations to waver.`,
        
        exploration: `🛡️ Strategic Wisdom: "The greatest victory is achieved before the first blow is struck. ${research.name} teaches us that true combat begins in the mind, where fear and confidence wage their eternal war." - General Thane Ironwill, from his treatise "The Art of Honorable War"`,
        
        discovery: `⚡ Combat Philosophy: Master Lyra Swiftblade's personal notes reveal: "I have discovered that ${research.name} is not about defeating enemies, but about achieving perfect harmony between intention and action. When this balance is found, victory becomes inevitable, for you are no longer fighting your opponent - you are dancing with destiny itself."`,
        
        understanding: `🏆 Legendary Technique: The most advanced practitioners of ${research.name} were said to possess an almost supernatural awareness in battle. Historical accounts describe Master Chen the Serene defeating twelve armed opponents while blindfolded, relying solely on his mastery of the technique's principles to guide his movements.`,
        
        synthesis: `👑 Grandmaster's Secret: From the private journals of Grandmaster Aldric Stormwind: "Today I realized that ${research.name} has taught me to see battle as the universe sees time - not as a series of separate moments, but as a single, flowing continuum where past, present, and future exist simultaneously."`,
        
        mastery: `🌟 Transcendent Understanding: The final scroll of the ${research.name} collection contains this cryptic passage: "When the student becomes the master, they discover that the techniques were never about combat at all, but about understanding the fundamental nature of conflict itself - and through that understanding, achieving a peace that surpasses all warfare."`,
        
        transcendence: `💫 Eternal Wisdom: Ancient prophecies speak of warriors who mastered ${research.name} so completely that they could end wars with a single gesture, not through violence, but through the sheer force of their presence. They became living embodiments of the principle that true strength lies in the wisdom to know when not to fight.`,
        
        enlightenment: `🔮 Ultimate Truth: You have achieved what the ancients called "The Warrior's Paradox" - complete mastery of ${research.name} has taught you that the highest form of combat is the prevention of combat itself. You have become a guardian of peace through your mastery of war.`
      },
      
      magic: {
        initiation: `📚 Arcane History: The foundations of ${research.name} were laid during the Age of Wonder, when the first Archmages discovered how to harness the raw chaos of creation itself. The original research was conducted in the floating city of Aethermoor, where the boundaries between dimensions were thin enough to allow direct observation of magical phenomena.`,
        
        foundation: `🔮 Theoretical Framework: Archmage Celestine's groundbreaking work "The Principles of Magical Resonance" established that ${research.name} operates on the principle of sympathetic vibration - the idea that all magical energy resonates at specific frequencies, and mastery comes from learning to attune oneself to these cosmic harmonies.`,
        
        exploration: `✨ Mystical Revelation: The lost journals of Sage Meridian contain this insight: "I have come to understand that ${research.name} is not about imposing our will upon reality, but about convincing reality that our will is its own. The most powerful magic feels effortless because it works with the natural flow of cosmic forces."`,
        
        discovery: `🌙 Lunar Observations: During the Great Conjunction of 847, when all three moons aligned, researchers at the Celestial Observatory documented that practitioners of ${research.name} experienced a 300% increase in magical potency. This led to the discovery that the technique naturally harmonizes with celestial cycles.`,
        
        understanding: `⭐ Stellar Wisdom: From the encrypted notes of Archmage Voidwhisper: "The advanced applications of ${research.name} have shown me that magic is not a tool we use, but a language we speak. At the highest levels, spells become conversations with the universe itself, and the universe, it seems, is quite eager to listen."`,
        
        synthesis: `🌌 Cosmic Insight: The Ethereal Academy's research indicates that masters of ${research.name} begin to exhibit what scholars term "Reality Fluidity" - the ability to exist simultaneously in multiple dimensional states. This explains why the greatest mages seem to know things they could not possibly have learned through conventional means.`,
        
        mastery: `🔥 Primordial Knowledge: Ancient texts speak of mages who mastered ${research.name} so completely that they could commune directly with the Primordial Forces that shaped the universe. These legendary figures were said to understand magic not as a learned skill, but as a fundamental aspect of existence itself.`,
        
        transcendence: `💎 Crystallized Wisdom: The Diamond Codex, written by the legendary Archmage Eternus, states: "Those who achieve true mastery of ${research.name} discover that they have not learned to control magic - they have learned to become magic. The distinction between caster and spell dissolves, leaving only pure creative force."`,
        
        enlightenment: `🌠 Infinite Understanding: You have achieved what the ancients called "The Mage's Apotheosis" - complete unity with the magical forces of ${research.name}. You understand now that magic was never separate from you; you were always magic, simply learning to remember what you had forgotten.`
      },
      
      crafting: {
        initiation: `🔨 Artisan's Legacy: The techniques of ${research.name} trace their origins to the legendary Dwarven Golden Age, when Master Smith Thorek Ironforge first discovered how to imbue raw materials with the essence of their intended purpose. His workshop, carved into the heart of Mount Goldpeak, still resonates with the echoes of his greatest creations.`,
        
        foundation: `⚒️ Guild Wisdom: The Artisan's Codex states: "True mastery of ${research.name} begins when the craftsman stops trying to impose their will upon the materials and starts listening to what the materials wish to become. Every piece of wood, every ingot of metal, carries within it the dream of its perfect form."`,
        
        exploration: `🎨 Creative Philosophy: Master Artisan Elena Goldweaver's personal notes reveal: "I have discovered that ${research.name} is as much about understanding the soul of creation as it is about technical skill. When I work now, I feel as though I am not making something new, but revealing something that was always meant to exist."`,
        
        discovery: `💎 Crystalline Insight: The discovery of Resonance Crystals in the Deep Mines revolutionized ${research.name}. These crystals, when properly attuned, allow craftsmen to perceive the "ideal form" of any object they wish to create, seeing the finished masterpiece before the first tool is lifted.`,
        
        understanding: `🏺 Masterwork Principles: From the sealed archives of the Grand Artisan's Guild: "Advanced practitioners of ${research.name} report entering a state they call 'The Flow' - a trance-like condition where their hands move without conscious direction, guided by an intuitive understanding that transcends mere technique."`,
        
        synthesis: `🌟 Transcendent Craft: The legendary Master Artificer Gideon Starforge wrote: "When one truly masters ${research.name}, the boundary between creator and creation dissolves. I no longer make objects - I give birth to possibilities. Each piece I complete feels less like work and more like a conversation with the universe about what should exist."`,
        
        mastery: `👑 Royal Commission: Historical records show that masters of ${research.name} were so revered that kings would wait years for a single piece of their work. The Crown Jewels of seven kingdoms contain artifacts created using these techniques, each one considered a national treasure worth more than entire armies.`,
        
        transcendence: `🔮 Mystical Integration: The most accomplished practitioners of ${research.name} are said to achieve a state where their creations take on lives of their own. Weapons that grow sharper with use, armor that adapts to protect its wearer, tools that seem to know their purpose before being picked up - these are the hallmarks of transcendent craftsmanship.`,
        
        enlightenment: `✨ Eternal Creation: You have achieved what the ancients called "The Artificer's Dream" - the ability to create objects that exist beyond the physical realm. Your mastery of ${research.name} has taught you that the greatest creations are not things, but experiences, emotions, and memories given tangible form.`
      }
    };
    
    return knowledge[category as keyof typeof knowledge]?.[phase] || 
           `📖 Research Note: Your continued study of ${research.name} reveals new layers of complexity and beauty in this ancient discipline.`;
  };

  const getProgressColor = (progress: number) => {
    if (progress < 15) return colors.error;
    if (progress < 30) return '#FF6B35';
    if (progress < 50) return colors.warning;
    if (progress < 70) return '#4ECDC4';
    if (progress < 85) return colors.primary;
    if (progress < 95) return '#9B59B6';
    return colors.success;
  };

  const getPhaseIcon = (progress: number) => {
    const phase = getResearchPhase(progress);
    switch (phase) {
      case 'initiation': return '🌱';
      case 'foundation': return '🏗️';
      case 'exploration': return '🔍';
      case 'discovery': return '💡';
      case 'understanding': return '🧠';
      case 'synthesis': return '⚗️';
      case 'mastery': return '⭐';
      case 'transcendence': return '👑';
      case 'enlightenment': return '✨';
      default: return '📖';
    }
  };

  const getPhaseDescription = (progress: number) => {
    const phase = getResearchPhase(progress);
    switch (phase) {
      case 'initiation': return 'Beginning the journey of understanding';
      case 'foundation': return 'Building fundamental knowledge';
      case 'exploration': return 'Discovering deeper principles';
      case 'discovery': return 'Breakthrough moments of insight';
      case 'understanding': return 'Grasping advanced concepts';
      case 'synthesis': return 'Combining knowledge into wisdom';
      case 'mastery': return 'Achieving technical excellence';
      case 'transcendence': return 'Surpassing conventional limits';
      case 'enlightenment': return 'Reaching perfect understanding';
      default: return 'Progressing through study';
    }
  };

  const renderStatBoosts = (research: Research) => {
    if (!research.rewards.statBoosts) return null;
    
    return (
      <>
        {Object.entries(research.rewards.statBoosts).map(([stat, value]) => (
          <Text key={stat} style={styles.benefit}>
            ⬆️ +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
          </Text>
        ))}
      </>
    );
  };

  const renderUnlocks = (research: Research) => {
    if (!research.rewards.unlocks || research.rewards.unlocks.length === 0) return null;
    
    return (
      <>
        {research.rewards.unlocks.map(unlock => {
          if (unlock.startsWith('spell:')) {
            const spellName = unlock.split(':')[1].replace(/_/g, ' ');
            return (
              <Text key={unlock} style={styles.benefit}>
                ✨ Unlocks spell: {spellName.charAt(0).toUpperCase() + spellName.slice(1)}
              </Text>
            );
          } else if (unlock.startsWith('item:')) {
            const itemName = unlock.split(':')[1].replace(/_/g, ' ');
            return (
              <Text key={unlock} style={styles.benefit}>
                🔨 Unlocks item: {itemName.charAt(0).toUpperCase() + itemName.slice(1)}
              </Text>
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Library',
        }}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        <View style={styles.titleSection}>
          <Text style={styles.title}>📚 The Grand Library</Text>
          <Text style={styles.subtitle}>
            Delve into ancient knowledge and unlock the secrets of the ages through dedicated scholarly pursuit
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedResearch.length}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeResearch.length}</Text>
            <Text style={styles.statLabel}>Studying</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{availableResearch.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{diamonds}</Text>
            <Text style={styles.statLabel}>💎 Diamonds</Text>
          </View>
        </View>
        
        {startError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color={colors.error} />
            <Text style={styles.errorText}>{startError}</Text>
          </View>
        )}
        
        {/* Active Research with Compact Layout */}
        {activeResearch.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔬 Active Research</Text>
            {activeResearch.map(research => {
              const progressPercentage = getProgressPercentage(research);
              const timeRemaining = research.completedAt! - Date.now();
              const minutesRemaining = Math.ceil(timeRemaining / (1000 * 60));
              const diamondCost = Math.max(1, Math.floor(minutesRemaining / 2));
              const timeData = formatTimeRemaining(research.completedAt!);
              
              return (
                <View key={research.id} style={styles.activeResearchCard}>
                  {/* Compact Header with Title and Skip Button */}
                  <View style={styles.compactHeader}>
                    <View style={styles.researchTitleSection}>
                      <Text style={styles.researchIcon}>
                        {getCategoryIcon(research.category)}
                      </Text>
                      <View style={styles.titleAndCategory}>
                        <Text style={styles.researchName}>{research.name}</Text>
                        <Text style={[styles.categoryBadge, { color: getCategoryColor(research.category) }]}>
                          {research.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.compactSkipButton}
                      onPress={() => handleSkipResearch(research)}
                    >
                      <Zap size={16} color={colors.text} />
                      <Text style={styles.skipButtonText}>{diamondCost}💎</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Compact Progress Section */}
                  <View style={styles.compactProgressSection}>
                    {/* Numerical Countdown */}
                    <View style={styles.countdownDisplay}>
                      <Clock size={16} color={getProgressColor(progressPercentage)} />
                      <Text style={[styles.countdownText, { color: getProgressColor(progressPercentage) }]}>
                        {timeData.display}
                      </Text>
                      <Text style={styles.countdownLabel}>remaining</Text>
                    </View>
                    
                    {/* Progress Bar with App Colors */}
                    <View style={styles.progressBarSection}>
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${progressPercentage}%`,
                                backgroundColor: getProgressColor(progressPercentage),
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressPercentageText}>
                          {Math.round(progressPercentage)}%
                        </Text>
                      </View>
                      
                      {/* Phase Indicator */}
                      <View style={styles.phaseIndicator}>
                        <Text style={styles.phaseIcon}>{getPhaseIcon(progressPercentage)}</Text>
                        <Text style={[styles.phaseText, { color: getProgressColor(progressPercentage) }]}>
                          {getResearchPhase(progressPercentage).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.researchDescription}>{research.description}</Text>
                  
                  {/* Compact Benefits */}
                  <View style={styles.compactBenefitsContainer}>
                    <Text style={styles.benefitsTitle}>🎁 Rewards:</Text>
                    <View style={styles.benefitsRow}>
                      <Text style={styles.benefit}>⭐ +{research.rewards.experience || 0} XP</Text>
                      {renderStatBoosts(research)}
                      {renderUnlocks(research)}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Available Research */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Available Research</Text>
          {availableResearch.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No research available at your current level</Text>
              <Text style={styles.emptySubtext}>
                Level up or complete prerequisite research to unlock more scholarly pursuits
              </Text>
            </View>
          ) : (
            availableResearch.map(research => (
              <View
                key={research.id}
                style={[
                  styles.researchCard,
                  { borderLeftColor: getCategoryColor(research.category) }
                ]}
              >
                <View style={styles.researchHeader}>
                  <View style={styles.researchTitleContainer}>
                    <Text style={styles.researchIcon}>
                      {getCategoryIcon(research.category)}
                    </Text>
                    <Text style={styles.researchName}>{research.name}</Text>
                  </View>
                  <View style={styles.researchMeta}>
                    <Text style={[styles.categoryBadge, { backgroundColor: getCategoryColor(research.category) }]}>
                      {research.category.toUpperCase()}
                    </Text>
                    <Text style={styles.duration}>
                      {Math.floor(research.duration / 1000 / 60)}m
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.researchDescription}>{research.description}</Text>
                
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Prerequisites:</Text>
                  <Text style={styles.requirement}>📊 Level {research.requirements.level}</Text>
                  {research.requirements.prerequisites && research.requirements.prerequisites.length > 0 && (
                    <Text style={styles.requirement}>
                      📚 Complete: {research.requirements.prerequisites.map(prereq => {
                        const prereqResearch = initialResearch.find(r => r.id === prereq);
                        return prereqResearch ? prereqResearch.name : prereq;
                      }).join(', ')}
                    </Text>
                  )}
                </View>
                
                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>Scholarly Rewards:</Text>
                  <Text style={styles.benefit}>⭐ +{research.rewards.experience || 0} XP</Text>
                  {renderStatBoosts(research)}
                  {renderUnlocks(research)}
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.researchButton,
                    isStarting && selectedResearch?.id === research.id ? styles.researchButtonDisabled : null
                  ]}
                  onPress={() => handleStartResearch(research)}
                  disabled={isStarting && selectedResearch?.id === research.id}
                >
                  {isStarting && selectedResearch?.id === research.id ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <>
                      <Play size={isTablet ? 20 : 16} color={colors.text} />
                      <Text style={styles.researchButtonText}>Begin Study</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        
        {/* Completed Research */}
        {completedResearch.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Mastered Knowledge</Text>
            {completedResearch.map(research => (
              <View
                key={research.id}
                style={[
                  styles.completedResearchCard,
                  { borderLeftColor: getCategoryColor(research.category) }
                ]}
              >
                <View style={styles.researchHeader}>
                  <View style={styles.researchTitleContainer}>
                    <Text style={styles.researchIcon}>
                      {getCategoryIcon(research.category)}
                    </Text>
                    <Text style={styles.researchName}>{research.name}</Text>
                  </View>
                  <CheckCircle size={24} color={colors.success} />
                </View>
                
                <Text style={styles.researchDescription}>{research.description}</Text>
                
                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>Knowledge Gained:</Text>
                  <Text style={styles.benefit}>⭐ +{research.rewards.experience || 0} XP</Text>
                  {renderStatBoosts(research)}
                  {renderUnlocks(research)}
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* Research Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Scholar's Wisdom</Text>
          <View style={styles.tipsContainer}>
            <Text style={styles.tip}>
              • Research continues even when you venture forth from the library
            </Text>
            <Text style={styles.tip}>
              • Channel mystical energy (diamonds) to accelerate your studies
            </Text>
            <Text style={styles.tip}>
              • Advanced research unlocks powerful spells and crafting techniques
            </Text>
            <Text style={styles.tip}>
              • Higher level studies yield greater wisdom and abilities
            </Text>
            <Text style={styles.tip}>
              • Complete foundational research to access advanced scholarly pursuits
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// For accessing research data in the component
const initialResearch = [
  {
    id: 'basic_combat',
    name: 'Basic Combat Techniques',
  },
  {
    id: 'advanced_combat',
    name: 'Advanced Combat Strategies',
  },
  {
    id: 'elemental_magic',
    name: 'Elemental Magic Basics',
  },
  {
    id: 'arcane_rituals',
    name: 'Arcane Rituals',
  },
  {
    id: 'basic_crafting',
    name: 'Basic Crafting Skills',
  },
  {
    id: 'advanced_crafting',
    name: 'Advanced Crafting Techniques',
  },
  {
    id: 'defensive_tactics',
    name: 'Defensive Tactics',
  },
  {
    id: 'healing_arts',
    name: 'Healing Arts',
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 32,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: isTablet ? 26 : 22,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: isTablet ? 12 : 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  activeResearchCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  
  // Compact Header Styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  researchTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  titleAndCategory: {
    flex: 1,
  },
  compactSkipButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  // Compact Progress Section Styles
  compactProgressSection: {
    marginBottom: 12,
    gap: 8,
  },
  countdownDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  countdownText: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
  },
  countdownLabel: {
    fontSize: isTablet ? 12 : 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressBarSection: {
    gap: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceDark,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  phaseIcon: {
    fontSize: 16,
  },
  phaseText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Compact Benefits Styles
  compactBenefitsContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  researchCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedResearchCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.8,
  },
  researchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  researchTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  researchIcon: {
    fontSize: isTablet ? 28 : 24,
    marginRight: 12,
  },
  researchName: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  researchMeta: {
    alignItems: 'flex-end',
  },
  categoryBadge: {
    fontSize: isTablet ? 11 : 10,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: isTablet ? 8 : 6,
    paddingVertical: isTablet ? 4 : 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  duration: {
    fontSize: isTablet ? 14 : 12,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  researchDescription: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: isTablet ? 24 : 20,
  },
  requirementsContainer: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  requirement: {
    fontSize: isTablet ? 15 : 13,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  benefitsContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: isTablet ? 16 : 12,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  benefit: {
    fontSize: isTablet ? 14 : 12,
    color: colors.text,
    marginBottom: 3,
    fontWeight: '600',
  },
  researchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: isTablet ? 16 : 14,
    paddingHorizontal: isTablet ? 24 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  researchButtonDisabled: {
    opacity: 0.7,
  },
  researchButtonText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 40 : 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: isTablet ? 20 : 18,
    color: colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: isTablet ? 18 : 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: isTablet ? 26 : 22,
  },
  tipsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
  },
  tip: {
    fontSize: isTablet ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: isTablet ? 24 : 20,
  },
});
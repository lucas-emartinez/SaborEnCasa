import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import { tipsData } from '@/assets/data/tips';

const { width } = Dimensions.get('window');

export default function TipDetailScreen() {
  const { id } = useLocalSearchParams();
  
  // Encontrar el tip actual
  const tipDetail = tipsData.find(tip => tip.id === id);

  // Si no se encuentra el tip, regresar a la pantalla anterior
  if (!tipDetail) {
    router.back();
    return null;
  }

  // Encontrar los tips relacionados
  const relatedTipsData = tipDetail.relatedTips
    .map(relatedId => tipsData.find(tip => tip.id === relatedId))
    .filter(Boolean);

  const renderContent = (item: any, index: number) => {
    switch (item.type) {
      case 'paragraph':
        return (
          <Text key={index} style={styles.paragraph}>
            {item.content}
          </Text>
        );
      
      case 'subtitle':
        return (
          <Text key={index} style={styles.subtitle}>
            {item.content}
          </Text>
        );
      
      case 'image':
        return (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={item.source}
              style={styles.contentImage}
              resizeMode="cover"
            />
            {item.caption && (
              <Text style={styles.imageCaption}>{item.caption}</Text>
            )}
          </View>
        );
      
      case 'bullets':
        return (
          <View key={index} style={styles.bulletContainer}>
            {item.content.map((bullet: string, bulletIndex: number) => (
              <View key={bulletIndex} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'tips':
        return (
          <View key={index} style={styles.tipsContainer}>
            {item.content.map((tip: any, tipIndex: number) => (
              <View key={tipIndex} style={styles.tipItem}>
                <Icon name="check-circle" size={20} color="#006943" />
                <View style={styles.tipTextContainer}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      
      case 'quote':
        return (
          <View key={index} style={styles.quoteContainer}>
            <Text style={styles.quoteText}>{item.content}</Text>
            {item.author && (
              <Text style={styles.quoteAuthor}>- {item.author}</Text>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tips Nutricionales</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={tipDetail.mainImage}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.heroContent}>
            <View style={styles.iconContainer}>
              <Icon name={tipDetail.iconName} size={32} color="#006943" />
            </View>
            <Text style={styles.title}>{tipDetail.title}</Text>
            <Text style={styles.description}>{tipDetail.description}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {tipDetail.fullContent.map((item, index) => renderContent(item, index))}
        </View>

        {/* Related Tips */}
        {relatedTipsData.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Tips relacionados</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedContent}
            >
              {relatedTipsData.map((tip) => (
                <TouchableOpacity
                  key={tip.id}
                  style={styles.relatedTip}
                  onPress={() => router.push({
                    pathname: '/(logged)/tips/[id]', 
                    params: { id: tip.id }
                })}
                >
                  <View style={styles.relatedIconContainer}>
                    <Icon name={tip.iconName} size={20} color="#006943" />
                  </View>
                  <Text style={styles.relatedTipTitle}>{tip.title}</Text>
                  <Icon name="chevron-right" size={16} color="#006943" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 36,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#f8f8f8',
  },
  mainImage: {
    width: width,
    height: width * 0.6,
  },
  heroContent: {
    alignItems: 'center',
    padding: 20,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -32,
    borderWidth: 4,
    borderColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    padding: 20,
  },
  paragraph: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  imageContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  contentImage: {
    width: '100%',
    height: width * 0.5,
  },
  imageCaption: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  bulletContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#006943',
    marginRight: 8,
    marginTop: 8,
  },
  bulletText: {
    fontSize: 16,
    color: '#444',
    flex: 1,
    lineHeight: 22,
  },
  tipsContainer: {
    marginVertical: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tipTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quoteContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
  },
  quoteIcon: {
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  relatedSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
    borderTopWidth: 8,
    borderTopColor: '#f8f8f8',
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  relatedContent: {
    paddingBottom: 16,
  },
  relatedTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    width: width - 80,
  },
  relatedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f4ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relatedTipTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});
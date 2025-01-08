import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  // Change the image
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // List of images
  const images = [
    require('../assets/img1.png'),
    require('../assets/img2.png'),
    require('../assets/img3.png'),
    require('../assets/img4.png'),
    require('../assets/img5.png'),
  ];

  // Change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/football-field.png')} // Đường dẫn logo của bạn
          style={styles.logo}
        />
        <Text style={styles.title}>Football Finder</Text>
        <Text style={styles.subtitle}>Ứng dụng giúp bạn tìm kiếm các sân bóng đá phù hợp nhất với bản thân</Text>
      </View>

      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <Image source={images[currentImageIndex]} style={styles.carouselImage} />
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Map')} // Điều hướng tới màn hình tìm kiếm
      >
        <Text style={styles.buttonText}>Bắt đầu</Text>
      </TouchableOpacity>

      {/* Guide Button */}
      <TouchableOpacity
        style={styles.guideButton}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="question-circle" size={28} color="#006600" />
      </TouchableOpacity>

      {/* Modal for Feature Guide */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hướng dẫn các chức năng chính</Text>
            <ScrollView>
              {images.map((image, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureTitle}>
                    {[
                      "Tìm sân bóng gần đoạn đường",
                      "Tìm sân bóng trong khu vực quận",
                      "Tìm sân bóng đá gần khu vực của bạn",
                      "Tìm các sân bóng có đánh giá tốt nhất",
                      "Tìm các sân bóng thuộc các sân liên hợp",
                    ][index]}
                  </Text>
                  <Image source={image} style={styles.featureImage} />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  imageContainer: {
    marginVertical: 30,
    width: '100%',
    height: 300,
    alignItems: 'center',
  },
  carouselImage: {
    width: '90%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#006600',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 0,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guideButton: {
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 10,
  },
  guideText: {
    fontSize: 16,
    color: '#006600',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: 500,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  menu: {
    backgroundColor: '#006600',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  menuText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 7,
    borderRadius: 8,
    width: '40%',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  featureItem: {
    marginBottom: 20,
    alignItems: 'center',
  },
  featureImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
});

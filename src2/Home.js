import React from 'react';
import { View, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonS} onPress={() => navigation.navigate('Screen1')}>
        <Text style={styles.buttonText}>Danh sách các rạp phim</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonS} onPress={() => navigation.navigate('Screen2')}>
        <Text style={styles.buttonText}>Tìm rạp phim gần nhất</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonS} onPress={() => navigation.navigate('Screen3')}>
        <Text style={styles.buttonText}>Tìm các rạp trong 1 quận</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonS} onPress={() => navigation.navigate('Screen4')}>
        <Text style={styles.buttonText}>Tìm các rạp phim trong bán kính</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonS} onPress={() => navigation.navigate('Screen5')}>
        <Text style={styles.buttonText}>Tìm các rạp phim gần với đường đi</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonS} onPress={() => navigation.navigate('Screen6')}>
        <Text style={styles.buttonText}>Tìm các rạp phim được đánh giá cao</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonS: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
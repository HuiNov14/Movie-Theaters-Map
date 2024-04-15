import { StyleSheet, Text, View, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function AddPlace({ route, navigation }) {

  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
      } else {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      }
    })();
  }, []);

  const locateUser = async () => {
    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation(location.coords);
  };
  const [region, setRegion] = useState(null);

  const [formattedAddress, setFormattedAddress] = useState('');
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setRegion({
          latitude: latitude, 
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421, 
        });

        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const newFormattedAddress = address
          .map(
            (address) =>
              `${address.streetNumber} ${address.street}, ${address.city}, ${address.region}, ${address.country}`
          )
          .join(', ');

        setFormattedAddress(newFormattedAddress);
        console.log('Current Address:', newFormattedAddress);
      } else {
        console.log('Permission to access location was denied');
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const { latitude = 0, longitude = 0 } = route.params || {};
  const customLatitude = latitude;
  const customLongitude = longitude;

  const getCustomLocation = async (customLatitude, customLongitude) => {
    navigation.navigate('Map');
    try {
      if (typeof customLatitude === 'number' && typeof customLongitude === 'number') {
        const latitude = customLatitude;
        const longitude = customLongitude;

        setRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        const address = await Location.reverseGeocodeAsync({
          latitude: latitude,
          longitude: longitude,
        });

        const newFormattedAddress = address
          .map(
            (address) =>
              `${address.streetNumber} ${address.street}, ${address.city}, ${address.region}, ${address.country}`
          )
          .join(', ');

        setFormattedAddress(newFormattedAddress);
        console.log('Custom Location Address:', newFormattedAddress);
      } else {
        console.error('Invalid latitude or longitude values');
      }
    } catch (error) {
      console.error('Error getting custom location:', error);
    }
  };

  const handleFindNearestCinema = async () => {
    try {
      const defaultLatitude = 10.875331012281416;
      const defaultLongitude = 106.80024285112276;

      setRegion({
        latitude: defaultLatitude,
        longitude: defaultLongitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: defaultLatitude,
        longitude: defaultLongitude,
      });

      const newFormattedAddress = address
        .map(
          (address) =>
            `${address.streetNumber} ${address.street}, ${address.city}, ${address.region}, ${address.country}`
        )
        .join(', ');

      setFormattedAddress(newFormattedAddress);
      console.log('Default Location Address:', newFormattedAddress);

    } catch (error) {
      console.error('Error finding nearest cinema:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{marginTop: 10}}>
        <View style={{}}>

          {region ? (
            <View style={{ width:360, height: 500}}>
              <MapView style={{ width: 360, height: 500}} region={region}>
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
              </MapView>
            </View>
          ) : (
            <View style={{}}>
              <View style={styles.noImageContainer}>
                <Text>No location picked yet</Text>
              </View>
            </View>
          )}
        </View>
        <View style={{ marginTop: 70, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginTop: 20, }}>
          <TouchableOpacity onPress={getCurrentLocation}>
            <View style={styles.greenBorder}> 

              <Image source={require('../assets/map.png')} style={styles.image2}>

              </Image>
              <Text style={styles.text}>Locate User</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => getCustomLocation(customLatitude, customLongitude)}>
            <View style={styles.greenBorder}>

              <Image source={require('../assets/maps.png')} style={styles.image2}>

              </Image>
              <Text style={styles.text}>Pick on Map</Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>


      <View style={{ marginTop: 20 }}>
        <Button title="Find the nearest movie theater" onPress={handleFindNearestCinema}></Button>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  image: {
    width: 340,
    height: 210,
    marginBottom: 20,
  },
  noImageContainer: {
    width: 340,
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e1dd',
    marginHorizontal: 10,
  },
  greenBorder: {
    borderWidth: 2,
    borderColor: '#00BFFF',
    padding: 3,
    width: 150,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    justifyContent: 'center',
    fontSize: 13,
    textAlignVertical: 'center',
    marginRight: 20,
  },
  image2: {
    width: 25,
    height: 25,
    marginLeft: 15,
  },
});
import { StyleSheet, Text, View, Image, TouchableOpacity, Button, Dimensions, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import cinemaData from '../src/db.json';
import axios from 'axios';

const customIcon = require('../assets/placeholder.png'); //Icon Map

const cinemaIcon = require('../assets/cinema.png'); //Icon Map

export default function Screen2({ route, navigation }) {

  const defaultLocation = () => {
    return {
      latitude: 10.859313791905437,
      longitude: 106.60419726148713,
      latitudeDelta: 0.722,
      longitudeDelta: 0.421,
    };
  };

  const defaultUserLocation = {
    latitude: 10.847388306318624,
    longitude: 106.83729892481165,
  };

  const [currentLocation, setCurrentLocation] = useState(null); // No default location
  const [region, setRegion] = useState(defaultLocation());
  const [formattedAddress, setFormattedAddress] = useState('');
  const [nearestCinema, setNearestCinema] = useState(null);
  const [theaterMarkers, setTheaterMarkers] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

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

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { selectedLocation } = route.params;
      setCurrentLocation(selectedLocation);
      setRegion({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [route.params?.selectedLocation]);

  const getCurrentLocation = async () => {
    setCurrentLocation(defaultUserLocation); // lấy vị trí mặc định nếu xài máy ảo 
    setRegion({
      latitude: defaultUserLocation.latitude,
      longitude: defaultUserLocation.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    //Lấy vị trí hiện tại của user nếu xài điện thoại
    // const { status } = await Location.requestForegroundPermissionsAsync();
    // if (status === 'granted') {
    //   const location = await Location.getCurrentPositionAsync({});
    //   const { latitude, longitude } = location.coords;
    //   setCurrentLocation(location.coords);

    //   setRegion({
    //     latitude: latitude,
    //     longitude: longitude,
    //     latitudeDelta: 0.0922,
    //     longitudeDelta: 0.0421,
    //   });
    // }

    try {
      const address = await Location.reverseGeocodeAsync(defaultUserLocation);
      const newFormattedAddress = address
        .map(
          (address) =>
            `${address.streetNumber} ${address.street}, ${address.city}, ${address.region}, ${address.country}`
        )
        .join(', ');

      setFormattedAddress(newFormattedAddress);
      console.log('Current Address:', newFormattedAddress);
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleFindNearestCinema = async () => {
    try {
      if (currentLocation) {
        let nearestCinema = null;
        let nearestDistance = Infinity;

        cinemaData.forEach(cinema => {
          const { coordinates } = cinema.location;
          const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, coordinates[1], coordinates[0]);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestCinema = cinema;
          }
        });

        if (nearestCinema) {
          setNearestCinema(nearestCinema);

          setRegion({
            latitude: nearestCinema.location.coordinates[1],
            longitude: nearestCinema.location.coordinates[0],
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          const address = await Location.reverseGeocodeAsync({
            latitude: nearestCinema.location.coordinates[1],
            longitude: nearestCinema.location.coordinates[0],
          });

          const newFormattedAddress = address
            .map(
              (address) =>
                `${address.streetNumber} ${address.street}, ${address.city}, ${address.region}, ${address.country}`
            )
            .join(', ');

          setFormattedAddress(newFormattedAddress);
          console.log('Nearest Cinema Address:', newFormattedAddress);
        } else {
          console.log('No cinema found');
        }
      } else {
        console.log('Current location not available');
      }
    } catch (error) {
      console.error('Error finding nearest cinema:', error);
    }
  };

  const handleShowDirections = () => {
    if (nearestCinema && currentLocation) {
      const fetchRoute = async () => {
        const apiKey = '5b3ce3597851110001cf62484ed9d53e837c4fc695df13f6acd4455a'; // Thay YOUR_API_KEY bằng API key của bạn
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${currentLocation.longitude},${currentLocation.latitude}&end=${nearestCinema.location.coordinates[0]},${nearestCinema.location.coordinates[1]}`;

        try {
          const response = await axios.get(url);
          console.log('Đã lấy thông tin đường đi');

          // Kiểm tra xem response.data có tồn tại và có chứa features hay không
          if (response.data && response.data.features && response.data.features.length > 0) {
            const features = response.data.features[0];

            // Kiểm tra xem features.geometry có tồn tại
            if (features.geometry && features.geometry.coordinates) {
              const coords = features.geometry.coordinates.map(point => ({
                latitude: point[1], // latitude
                longitude: point[0], // longitude
              }));
              setRouteCoords(coords);
            } else {
              console.error('Missing geometry in features:', features);
            }
          } else {
            console.error('No features found in response:', response.data);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
        }
      };

      fetchRoute();
      setShowDirections(true);
    } else {
      console.log('Nearest cinema or current location not available');
    }
  };

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d;
  };

  return (
    <View style={styles.container}>
      <View>
        <View>
          {region ? (
            <View style={{ width: 400, height: 650 }}>
              <MapView style={{ width: 400, height: 650 }} region={region}>
                {/* Hiển thị Marker cho vị trí hiện tại */}
                {currentLocation && (
                  <Marker
                    coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
                    title="Your Location"
                    description="You are here"
                  >
                    <Image source={customIcon} style={{ width: 30, height: 30 }} />
                  </Marker>
                )}

                {/* Hiển thị Marker cho rạp chiếu phim gần nhất */}
                {nearestCinema && (
                  <Marker
                    coordinate={{ latitude: nearestCinema.location.coordinates[1], longitude: nearestCinema.location.coordinates[0] }}
                    title={nearestCinema.cinema_name}
                    description={nearestCinema.location_name}
                  >
                  <Image source={cinemaIcon} style={{ width: 30, height: 30 }} />
                  </Marker>
                )}

                {/* Hiển thị tuyến đường đến rạp chiếu phim gần nhất */}
                {showDirections && (
                  <Polyline coordinates={routeCoords} strokeColor="#3498db" strokeWidth={3} />
                )}
              </MapView>
            </View>
          ) : (
            <View>
              <View style={styles.noImageContainer}>
                <Text>No location picked yet</Text>
              </View>
            </View>
          )}
        </View>
        <View style={{position:'absolute', width:'100%', flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={styles.greenBorder} onPress={handleFindNearestCinema}><Image source={require('../assets/cinema_icon.png')} style={styles.image2} /></TouchableOpacity>
            <TouchableOpacity style={styles.greenBorder} onPress={handleShowDirections}><Image source={require('../assets/destination.png')} style={styles.image2} /></TouchableOpacity>
        </View>
        <View style={{position:'absolute', bottom: 30, right: 10 }}>
        <TouchableOpacity style={styles.greenBorder} onPress={getCurrentLocation}><Image source={require('../assets/placeholder.png')} style={styles.image2} /></TouchableOpacity>
        </View>
        <View style={{position:'absolute', bottom: 30, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginTop: 5 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <View style={styles.greenBorder}>
              <Image source={require('../assets/google-maps.png')} style={styles.image2} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#333',
    width: 50,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 5,
    alignItems:'center',
  },
  text: {
    justifyContent: 'center',
    fontSize: 13,
    textAlignVertical: 'center',
    marginRight: 20,
  },
  image2: {
    width: 30,
    height: 30,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
    padding: 10,
    width: '68%',
    borderRadius: 5,
    marginTop: 10,
    marginLeft: 10,
    height: 50,

  },
  menu: {
    paddingHorizontal: 10, 
    paddingVertical: 5,
     marginRight: 10, 
     backgroundColor: 'white', 
     borderRadius: 5 ,
  }
});

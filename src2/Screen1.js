import { StyleSheet, Text, View, Image, TouchableOpacity, Button, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import cinemaData from '../src/db.json';
import axios from 'axios';

export default function Screen1({ route, navigation }) {

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

  const getCurrentLocation = async () => {
    setCurrentLocation(defaultUserLocation); // lấy vị trí mặc định nếu xài máy ảo 
    setRegion({
      latitude: defaultUserLocation.latitude,
      longitude: defaultUserLocation.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    //Lấy vị trí hiện tại của user nếu xài điện thoại
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation(location.coords);

      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }

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

  const { latitude = 0, longitude = 0 } = route.params || {};
  const customLatitude = latitude;
  const customLongitude = longitude;

  const handleFindNearbyMovieTheaters = async () => {
    try {
      if (currentLocation) {
        const nearbyTheaters = [];

        cinemaData.forEach(cinema => {
          const { coordinates } = cinema.location;
          const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, coordinates[1], coordinates[0]);
          if (distance <= 20000) { // Check if distance is less than or equal to 20km
            nearbyTheaters.push(cinema);
          }
        });

        if (nearbyTheaters.length > 0) {
          // Set nearby theaters state
          setNearestCinema(null);

          // Set markers for nearby theaters
          const theaterMarkers = nearbyTheaters.map(cinema => ({
            coordinate: { latitude: cinema.location.coordinates[1], longitude: cinema.location.coordinates[0] },
            title: cinema.cinema_name,
            description: cinema.location_name,
          }));

          // Update the markers state
          setTheaterMarkers(theaterMarkers);

          setRegion({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          const addresses = await Promise.all(nearbyTheaters.map(async (cinema) => {
            const address = await Location.reverseGeocodeAsync({
              latitude: cinema.location.coordinates[1],
              longitude: cinema.location.coordinates[0],
            });
            return address.map(addr =>
              `${addr.streetNumber} ${addr.street}, ${addr.city}, ${addr.region}, ${addr.country}`
            ).join(', ');
          }));

          const formattedAddresses = addresses.join('\n');
          console.log('Nearby Movie Theaters Addresses:', formattedAddresses);
        } else {
          console.log('No nearby movie theaters found');
        }
      } else {
        console.log('Current location not available');
      }
    } catch (error) {
      console.error('Error finding nearby movie theaters:', error);
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
      <View style={{ marginTop: 10 }}>
        <View>
          {region ? (
            <View style={{ width: 360, height: 580 }}>
              <MapView style={{ width: 360, height: 580 }} region={region}>
                {/* Hiển thị Marker cho vị trí hiện tại */}
                {currentLocation && (
                  <Marker
                    coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
                    title="Your Location"
                    description="You are here"
                  />
                )}

                {/* Hiển thị Markers cho các rạp chiếu phim gần đó */}
                {theaterMarkers.map((marker, index) => (
                  <Marker
                    key={index}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                  />
                ))}
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
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <TouchableOpacity onPress={getCurrentLocation}>
            <View style={styles.greenBorder}>
              <Image source={require('../assets/map.png')} style={styles.image2} />
              <Text style={styles.text}>Locate User</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Find movie theaters nearby" onPress={handleFindNearbyMovieTheaters}></Button>
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

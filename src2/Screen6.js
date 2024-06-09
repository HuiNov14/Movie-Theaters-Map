import { StyleSheet, Text, View, Image, TouchableOpacity, Button, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import cinemaData from '../src/db.json'; // Assuming this is your cinema data
import districtData from './districtPolygons.json'; // Assuming you have your district data in this file

export default function Screen6({ route, navigation }) {

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

  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(defaultLocation());
  const [formattedAddress, setFormattedAddress] = useState('');
  const [nearestCinema, setNearestCinema] = useState(null);
  const [theaterMarkers, setTheaterMarkers] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [district, setDistrict] = useState(''); // State to hold the district input
  const [cinemasInDistrict, setCinemasInDistrict] = useState([]); // State to hold cinemas in the district
  const [districtBoundary, setDistrictBoundary] = useState(null); // State to hold the district boundary
  const [ratingThreshold, setRatingThreshold] = useState(''); // State to hold the rating threshold

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      } else {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      }
    })();
  }, []);

  const getCurrentLocation = async () => {
    setCurrentLocation(defaultUserLocation); // Default location for emulator
    setRegion({
      latitude: defaultUserLocation.latitude,
      longitude: defaultUserLocation.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

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

  const handleFindCinemasInDistrict = () => {
    if (district) {
      const cinemas = cinemaData.filter(cinema => cinema.address.includes(district) && cinema.rating > ratingThreshold);
      setCinemasInDistrict(cinemas);

      const districtInfo = districtData.features.find(feature => feature.properties.Ten_Huyen === district);
      if (districtInfo) {
        setDistrictBoundary(districtInfo.geometry.coordinates[0]);
      }

      if (cinemas.length > 0) {
        const districtMarkers = cinemas.map(cinema => ({
          coordinate: { latitude: cinema.location.coordinates[1], longitude: cinema.location.coordinates[0] },
          title: cinema.cinema_name,
          description: cinema.address,
        }));
        setTheaterMarkers(districtMarkers);
        setRegion({
          latitude: cinemas[0].location.coordinates[1],
          longitude: cinemas[0].location.coordinates[0],
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        console.log('No cinemas found in the district');
      }
    } else {
      console.log('Please enter a district');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }}>
        <View>
          {region ? (
            <View style={{ width: 360, height: 400 }}>
              <MapView style={{ width: 360, height: 400 }} region={region}>
                {currentLocation && (
                  <Marker
                    coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
                    title="Your Location"
                    description="You are here"
                  />
                )}

                {theaterMarkers.map((marker, index) => (
                  <Marker
                    key={index}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                  />
                ))}

                {districtBoundary && (
                  <Polygon
                    coordinates={districtBoundary.map(coord => ({ latitude: coord[1], longitude: coord[0] }))}
                    strokeColor="#FF0000"
                    fillColor="rgba(255,0,0,0.2)"
                    strokeWidth={2}
                  />
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
        <TextInput
          style={styles.input}
          placeholder="Enter district name"
          value={district}
          onChangeText={setDistrict}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter rating threshold"
          value={String(ratingThreshold)}
          onChangeText={setRatingThreshold}
          keyboardType="numeric"
        />
        <Button title="Find cinemas in district" onPress={handleFindCinemasInDistrict}></Button>
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingLeft: 10,
  },
});

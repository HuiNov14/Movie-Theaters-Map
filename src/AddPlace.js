import { StyleSheet, Text, View, Image, TouchableOpacity, Button, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import cinemaData from './db.json'; // Import dữ liệu từ file db.json
import axios from 'axios';

export default function AddPlace({ route, navigation }) {
  const defaultLocation = () => {
    return {
      latitude: 10.859313791905437,
      longitude: 106.60419726148713,
      latitudeDelta: 0.722,
      longitudeDelta: 0.421,
    };
  };

  const defaultUserLocation = {
    latitude: 10.784030297891997,
    longitude: 106.69214466713932,
    latitudeDelta: 0.722,
    longitudeDelta: 0.421,
  };

  const [currentLocation, setCurrentLocation] = useState(null); // No default location
  const [region, setRegion] = useState(defaultLocation());
  const [formattedAddress, setFormattedAddress] = useState('');
  const [district, setDistrict] = useState(''); // Biến trạng thái để lưu thông tin quận
  const [nearestCinema, setNearestCinema] = useState(null);
  const [theaterMarkers, setTheaterMarkers] = useState([]);
  const [showDirections, setShowDirections] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [districtCinemas, setDistrictCinemas] = useState([]);

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
  
    try {
      const address = await Location.reverseGeocodeAsync(defaultUserLocation);
      const newFormattedAddress = address
        .map(
          (address) =>
            `${address.streetNumber} ${address.street}, ${address.subregion}, ${address.city}, ${address.region}, ${address.country}`
        )
        .join(', ');
  
      setFormattedAddress(newFormattedAddress);
      const subregion = address[0].subregion;
      setDistrict(subregion); // Lưu thông tin quận vào biến trạng thái
      console.log('Current Address:', newFormattedAddress);
      console.log('District:', subregion); // Log thông tin quận
    } catch (error) {
      console.error('Error getting address:', error);
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
              `${address.streetNumber} ${address.street}, ${address.subregion}, ${address.city}, ${address.region}, ${address.country}`
          )
          .join(', ');

        setFormattedAddress(newFormattedAddress);
        setDistrict(address[0].subregion); // Lưu thông tin quận vào biến trạng thái
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
      if (currentLocation) {
        let nearestCinema = null;
        let nearestDistance = Infinity;

        cinemaData.forEach(cinema => {
          const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, cinema.latitude, cinema.longitude);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestCinema = cinema;
          }
        });

        if (nearestCinema) {
          setNearestCinema(nearestCinema);

          setRegion({
            latitude: nearestCinema.latitude,
            longitude: nearestCinema.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          const address = await Location.reverseGeocodeAsync({
            latitude: nearestCinema.latitude,
            longitude: nearestCinema.longitude,
          });

          const newFormattedAddress = address
            .map(
              (address) =>
                `${address.streetNumber} ${address.street}, ${address.subregion}, ${address.city}, ${address.region}, ${address.country}`
            )
            .join(', ');

          setFormattedAddress(newFormattedAddress);
          setDistrict(address[0].subregion); // Lưu thông tin quận vào biến trạng thái
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

  const handleFindNearbyMovieTheaters = async () => {
    try {
      if (currentLocation) {
        const nearbyTheaters = [];

        cinemaData.forEach(cinema => {
          const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, cinema.latitude, cinema.longitude);
          if (distance <= 5000) { // Check if distance is less than or equal to 5km
            nearbyTheaters.push(cinema);
          }
        });

        if (nearbyTheaters.length > 0) {
          // Set nearby theaters state
          setNearestCinema(null);

          // Set markers for nearby theaters
          const theaterMarkers = nearbyTheaters.map(cinema => ({
            coordinate: { latitude: cinema.latitude, longitude: cinema.longitude },
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
              latitude: cinema.latitude,
              longitude: cinema.longitude,
            });
            return address.map(addr =>
              `${addr.streetNumber} ${addr.street}, ${addr.subregion}, ${addr.city}, ${addr.region}, ${addr.country}`
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

  const handleShowDirections = () => {
    if (nearestCinema && currentLocation) {
      const fetchRoute = async () => {
        const apiKey = '5b3ce3597851110001cf62484ed9d53e837c4fc695df13f6acd4455a'; // Thay YOUR_API_KEY bằng API key của bạn
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${currentLocation.longitude},${currentLocation.latitude}&end=${nearestCinema.longitude},${nearestCinema.latitude}`;

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
    const Δλ = ((lon1 - lon2) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    return d;
  };

  const handleDeleteAll = () => {
    setCurrentLocation(null);
    setNearestCinema(null);
    setTheaterMarkers([]);
    setShowDirections(false);
    setDistrictCinemas([]);
  };

  const handleSearchByDistrict = async () => {
    if (!district || district.trim() === '') {
      console.log('Please enter a district');
      return;
    }
  
    try {
      const filteredCinemas = cinemaData.filter(cinema => {
        return cinema.location_name.toLowerCase().includes(district.toLowerCase());
      });
  
      if (filteredCinemas.length > 0) {
        setDistrictCinemas(filteredCinemas);
  
        // Set markers for filtered cinemas
        const theaterMarkers = filteredCinemas.map(cinema => ({
          coordinate: { latitude: cinema.latitude, longitude: cinema.longitude },
          title: cinema.cinema_name,
          description: cinema.location_name,
        }));
  
        setTheaterMarkers(theaterMarkers);
  
        // Update region to the first cinema in the filtered list
        setRegion({
          latitude: filteredCinemas[0].latitude,
          longitude: filteredCinemas[0].longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
  
        console.log('Filtered Cinemas:', filteredCinemas);
      } else {
        console.log('No cinemas found in this district');
      }
    } catch (error) {
      console.error('Error searching cinemas by district:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }}>
        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextInput
            style={styles.input}
            placeholder="Enter district"
            value={district}
            onChangeText={setDistrict}
          />
          <Button title="Search by District" onPress={handleSearchByDistrict} />
        </View>
      <View style={{ marginTop: 10 }}>
          {region ? (
            <View style={{ width: 360, height: 200 }}>
              <MapView style={{ width: 360, height: 200 }} region={region}>
                {/* Hiển thị Marker cho vị trí hiện tại */}
                {currentLocation && (
                  <Marker
                    coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
                    title="Your Location"
                    description="You are here"
                  />
                )}

                {/* Hiển thị Marker cho rạp chiếu phim gần nhất */}
                {nearestCinema && (
                  <Marker
                    coordinate={{ latitude: nearestCinema.latitude, longitude: nearestCinema.longitude }}
                    title={nearestCinema.cinema_name}
                    description={nearestCinema.location_name}
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

                  {/* Hiển thị Marker cho các rạp phim trong quận */}
                  {districtCinemas.map((cinema, index) => (
                    <Marker
                      key={index}
                      coordinate={{ latitude: cinema.latitude, longitude: cinema.longitude }}
                      title={cinema.cinema_name}
                      description={cinema.location_name}
                    />
                  ))}

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
        <View style={{ marginTop: 70, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginTop: 20 }}>
          <TouchableOpacity onPress={getCurrentLocation}>
            <View style={styles.greenBorder}>
              <Image source={require('../assets/map.png')} style={styles.image2} />
              <Text style={styles.text}>Locate User</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => getCustomLocation(customLatitude, customLongitude)}>
            <View style={styles.greenBorder}>
              <Image source={require('../assets/maps.png')} style={styles.image2} />
              <Text style={styles.text}>Pick on Map</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Find the nearest movie theater" onPress={handleFindNearestCinema}></Button>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Find movie theaters nearby" onPress={handleFindNearbyMovieTheaters}></Button>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Find the shortest route to the nearest cinema" onPress={handleShowDirections}></Button>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Delete All" onPress={handleDeleteAll}></Button>
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
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '60%',
    borderRadius: 5,
  },
});

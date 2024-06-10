import { StyleSheet, Text, View, Image, TouchableOpacity, Button, Dimensions, ScrollView, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import cinemaData from '../src/db.json';
import axios from 'axios';

const customIcon = require('../assets/placeholder.png'); //Icon Map

const cinemaIcon = require('../assets/cinema.png'); //Icon Map

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
  const [district, setDistrict] = useState(''); // State để lưu quận được nhập
  const [cinemasInDistrict, setCinemasInDistrict] = useState([]); // State để lưu các rạp phim trong quận
  const [districtBoundary, setDistrictBoundary] = useState(null);
  const [searchAddress, setSearchAddress] = useState(''); // New state for search input


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

  const { latitude = 0, longitude = 0 } = route.params || {};
  const customLatitude = latitude;
  const customLongitude = longitude;

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

  const handleFindNearbyMovieTheaters = async () => {
    try {
      if (currentLocation) {
        const nearbyTheaters = [];

        cinemaData.forEach(cinema => {
          const { coordinates } = cinema.location;
          const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, coordinates[1], coordinates[0]);
          if (distance <= 10000) { // Check if distance is less than or equal to 20km
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
            latitudeDelta: 0.4,
            longitudeDelta: 0.2,
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

  const handleFindCinemasInDistrict = () => {
    if (district) {
      const cinemas = cinemaData.filter(cinema => cinema.address.includes(district));
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

  const handleDeleteAll = () => {
    setCurrentLocation(null);
    setNearestCinema(null);
    setTheaterMarkers([]);
    setShowDirections(false);
    // setDistrictCinemas([]);
  };

  // const handleSearchAddress = async () => {
  //   const apiKey = '5b3ce3597851110001cf62484ed9d53e837c4fc695df13f6acd4455a';
  //   const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${currentLocation.longitude},${currentLocation.latitude}&end=${nearestCinema.location.coordinates[0]},${nearestCinema.location.coordinates[1]}`;

  //   try {
  //     const response = await axios.get(url);
  //     if (response.data.status === 'OK') {
  //       const location = response.data.results[0].geometry.location;
  //       setRegion({
  //         latitude: location.lat,
  //         longitude: location.lng,
  //         latitudeDelta: 0.0922,
  //         longitudeDelta: 0.0421,
  //       });

  //       // Add a marker for the searched address
  //       setTheaterMarkers([{
  //         coordinate: { latitude: location.lat, longitude: location.lng },
  //         title: 'Searched Address',
  //         description: searchAddress,
  //       }]);
  //     } else {
  //       console.error('Error getting geocode:', response.data.status);
  //     }
  //   } catch (error) {
  //     console.error('Error getting geocode:', error);
  //   }
  // };
  return (
    <ScrollView>
    <View style={styles.container}>
      <View >
        <View>
          {region ? (
            <View style={{ width: 400, height: 750 }}>
              <MapView style={{ width: 400, height: 750 }} region={region}>
                {/* Hiển thị Marker cho vị trí hiện tại */}
                {currentLocation && (
                  <Marker
                    coordinate={{ latitude: currentLocation.latitude, longitude: currentLocation.longitude }}
                    title="Vị trí của bạn"
                    description="You are here"
                  >
                  <Image source={customIcon} style={{ width: 50, height: 50 }} />
                  </Marker>
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
                {/* Hiển thị Marker cho rạp chiếu phim gần nhất */}
                {nearestCinema && (
                  <Marker
                    coordinate={{ latitude: nearestCinema.location.coordinates[1], longitude: nearestCinema.location.coordinates[0] }}
                    title={nearestCinema.cinema_name}
                    description={nearestCinema.location_name}
                  >
                  <Image source={cinemaIcon} style={{ width: 50, height: 50 }} />
                  </Marker>
                )}
                  {/* Hiển thị các rạp phim trong một quận */}
                {districtBoundary && (
                  <Polygon
                    coordinates={districtBoundary.map(coord => ({ latitude: coord[1], longitude: coord[0] }))}
                    strokeColor="#FF0000"
                    fillColor="rgba(255,0,0,0.2)"
                    strokeWidth={2}
                  />
                )}

                {/* Hiển thị tuyến đường đến rạp chiếu phim gần nhất */}
                {showDirections && (
                  <Polyline coordinates={routeCoords} strokeColor="#7f0d00" strokeWidth={3} />
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
              <TextInput
                style={styles.input}
                placeholder="Search by Address"
                value={searchAddress}
                onChangeText={text => setSearchAddress(text)}
              />
            <TouchableOpacity style={styles.greenBorder} onPress={handleFindNearestCinema}><Image source={require('../assets/cinema_icon.png')} style={styles.image2} /></TouchableOpacity>
            <TouchableOpacity style={styles.greenBorder} onPress={handleShowDirections}><Image source={require('../assets/destination.png')} style={styles.image2} /></TouchableOpacity>

        </View>
        <View style={{position:'absolute', bottom: 110, right: 10 }}>
        <TouchableOpacity style={styles.greenBorder} onPress={getCurrentLocation}><Image source={require('../assets/placeholder.png')} style={styles.image2} /></TouchableOpacity>
        </View>
        <View style={{position:'absolute', bottom: 110, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginTop: 5 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <View style={styles.greenBorder}>
              <Image source={require('../assets/google-maps.png')} style={styles.image2} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', padding: 10, position:'absolute', marginTop: 60, }}>
          <ScrollView horizontal>
            <TouchableOpacity onPress={handleFindNearestCinema} style={styles.menu}>
              <Text style={{color:"white", fontWeight: 'bold'}}>Các rạp chiếu phim gần bạn nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFindNearbyMovieTheaters} style={styles.menu}>
              <Text style={{color:"white", fontWeight: 'bold'}}>Rạp phim có đánh giá tốt nhất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menu}>
              <Text style={{color:"white", fontWeight: 'bold'}}>Tìm rạp phim trong khu vực quận</Text>
            </TouchableOpacity>
            {/* Thêm tùy chọn khác nếu cần */}
          </ScrollView>
        </View>
          <View style={{position:'absolute', bottom: 110, left:200, backgroundColor: '#7f0d00', borderRadius: 10}}>
            <TouchableOpacity title="xóa" onPress={handleDeleteAll} >
              <Text style={{color:"white", fontWeight: 'bold', padding: 5}}>Xóa</Text>
            </TouchableOpacity>
          </View>

      </View>
    </View>
    </ScrollView>
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
    borderWidth: 2,
    borderColor: '#7f0d00',
    width: 50,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 5,
    alignItems:'center',
  },
  greenBorder1: {
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
    borderWidth: 2,
    borderColor: '#7f0d00',
    backgroundColor: '#eee',
    padding: 10,
    width: '68%',
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    height: 50,

  },
  menu: {
    paddingHorizontal: 10, 
    paddingVertical: 5,
     marginRight: 10, 
     backgroundColor: '#7f0d00', 
     borderRadius: 20,
  }

});

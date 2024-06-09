import { StatusBar } from 'expo-status-bar';
import React , { useContext }from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import AddPlace from './AddPlace';
import HomeScreen from '../src2/Home';
import Screen1 from '../src2/Screen1';
import Screen2 from '../src2/Screen2';
import Screen3 from '../src2/Screen3';
import Screen4 from '../src2/Screen4';
import Screen5 from '../src2/Screen5';
import Screen6 from '../src2/Screen6';

export default function Setting({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
      />
      <Stack.Screen name="Screen1" component={Screen1} />
      <Stack.Screen name="Screen2" component={Screen2} />
      <Stack.Screen name="Screen3" component={Screen3} />
      <Stack.Screen name="Screen4" component={Screen4} />
      <Stack.Screen name="Screen5" component={Screen5} />
      <Stack.Screen name="Screen6" component={Screen6} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonAdd: {
  
    marginRight:15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  add: {
   height:30,
   width:30,
  },
});

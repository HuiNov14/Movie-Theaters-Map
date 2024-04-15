import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Setting = () => {
  return (
    <View style={styles.container}>
      <View>
        <Text>Setting screen</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:10,
  },
});

export default Setting
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import * as turf from '@turf/turf';
import jsonData from './export.json';

const parseData = (data) => {
  const nodes = {};
  const edges = [];

  data.features.forEach((feature) => {
    const coordinates = feature.geometry.coordinates;

    if (feature.geometry.type === "LineString") {
      for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i];
        const end = coordinates[i + 1];
        const startId = `${start[0]},${start[1]}`;
        const endId = `${end[0]},${end[1]}`;

        nodes[startId] = start;
        nodes[endId] = end;

        const distance = turf.distance(start, end);
        edges.push({ start: startId, end: endId, distance });
      }
    }
  });

  return { nodes, edges };
};

const { nodes, edges } = parseData(jsonData);

class PriorityQueue {
  constructor() {
    this.collection = [];
  }

  enqueue(element) {
    if (this.isEmpty()) {
      this.collection.push(element);
    } else {
      let added = false;
      for (let i = 1; i <= this.collection.length; i++) {
        if (element[1] < this.collection[i - 1][1]) {
          this.collection.splice(i - 1, 0, element);
          added = true;
          break;
        }
      }
      if (!added) {
        this.collection.push(element);
      }
    }
  }

  dequeue() {
    return this.collection.shift();
  }

  isEmpty() {
    return this.collection.length === 0;
  }
}

const dijkstra = (startNode, endNode, nodes, edges) => {
  let distances = {};
  let prev = {};
  let pq = new PriorityQueue();

  distances[startNode] = 0;
  pq.enqueue([startNode, 0]);

  Object.keys(nodes).forEach(node => {
    if (node !== startNode) {
      distances[node] = Infinity;
    }
    prev[node] = null;
  });

  while (!pq.isEmpty()) {
    let [currentNode, currentDistance] = pq.dequeue();

    if (currentNode === endNode) {
      let path = [];
      let lastNode = endNode;

      while (lastNode) {
        path.unshift(nodes[lastNode]);
        lastNode = prev[lastNode];
      }
      return path;
    }

    edges.forEach(edge => {
      if (edge.start === currentNode) {
        let neighbor = edge.end;
        let newDist = currentDistance + edge.distance;

        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
          prev[neighbor] = currentNode;
          pq.enqueue([neighbor, newDist]);
        }
      }
    });
  }

  return [];
};

const Map2 = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [path, setPath] = useState([]);

  const handleFindPath = () => {
    if (nodes[start] && nodes[end]) {
      const shortestPath = dijkstra(start, end, nodes, edges);
      setPath(shortestPath);
    } else {
      Alert.alert('Invalid start or end point');
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        <Polyline
          coordinates={path.map(coord => ({ latitude: coord[1], longitude: coord[0] }))}
          strokeColor="#000"
          strokeWidth={6}
        />
      </MapView>
      <TextInput
        style={styles.input}
        placeholder="Start (e.g., 106.8052434,10.8750419)"
        onChangeText={text => setStart(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="End (e.g., 106.8046673,10.8760654)"
        onChangeText={text => setEnd(text)}
      />
      <Button title="Find Path" onPress={handleFindPath} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '80%',
    paddingLeft: 10,
  },
  map: {
    width: '100%',
    height: '80%',
  },
});

export default Map2;

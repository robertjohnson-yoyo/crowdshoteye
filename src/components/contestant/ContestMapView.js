import React, {
  Component
} from 'react';
import {
  StyleSheet, View, Text, Animated, PanResponder,
  TouchableOpacity, Alert
} from 'react-native';
import {
  Sizes, Colors
} from '../../Const';
import * as Firebase from 'firebase';
import GeoFire from 'geofire';
import Database from '../../utils/Database';
import {
  Actions
} from 'react-native-router-flux';

// components
import MapView from 'react-native-maps';
import ContestMapMarker from './ContestMapMarker';

const LAT_DELTA = 0.01;
const LNG_DELTA = 0.01;

export default class ContestMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {

        // default location is Toronto
        latitude: 43.6525,
        longitude: -79.381667,
        latitudeDelta: LAT_DELTA,
        longitudeDelta: LNG_DELTA,
      },
      contests: {},
      inView: {},
    };

    this.ref = new GeoFire(
      Database.ref('locations')
    ).query({
      center: [
        this.state.region.latitude,
        this.state.region.longitude
      ],
      radius: GeoFire.distance(
        [this.state.region.latitude, this.state.region.longitude],
        [
          this.state.region.latitude
            + this.state.region.latitudeDelta / 2,
          this.state.region.longitude
            + this.state.region.longitudeDelta / 2
        ]
      )
    });

    // methods
    this.onRegionChange = this.onRegionChange.bind(this);
  }

  onRegionChange(region) {
    this.ref.updateCriteria({
      center: [
        region.latitude,
        region.longitude
      ],
      radius: GeoFire.distance(
        [region.latitude, region.longitude],
        [
          region.latitude + region.latitudeDelta / 2,
          region.longitude + region.longitudeDelta / 2
        ]
      )
    });

    this.setState({
      region: region
    });
  }

  componentDidMount() {

    // setup default location
    navigator.geolocation.getCurrentPosition(
      position => {
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: this.state.region.latitudeDelta,
          longitudeDelta: this.state.region.longitudeDelta
        };

        // trigger initial load
        this.onRegionChange(region);

        // and update server about contestant whereabouts
        new GeoFire(Database.ref('profileLocations')).set(
          Firebase.auth().currentUser.uid,
          [position.coords.latitude, position.coords.longitude]
        );
      },
      error => Alert.alert(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );

    // and update when a new contest comes into view
    this.ref.on('key_entered', (key, location, distance) => {

      // add to in view
      this.state.inView[key] = true;
      this.state.contests[key] = {
        location: {
          latitude: location[0],
          longitude: location[1]
        },
        distance: distance
      };
    });

    // remove when out of view
    this.ref.on('key_exited', (key, location, distance) => {
      delete this.state.inView[key];
    });
  }

  componentWillUnmount() {
    this.ref.cancel();
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <MapView
            ref='map'
            style={styles.map}
            region={this.state.region}
            onRegionChangeComplete={this.onRegionChange}>
            {
              Object.keys(this.state.contests).map((contest, i) => {
                return (
                  <ContestMapMarker
                    coordinate={this.state.contests[contest].location}
                    contestId={contest}
                    key={contest} />
                );
              })
            }
            {
              (
                Object.keys(this.state.inView).length > 0
              ) ? (
                <View />
              ): (
                <View style={styles.shadow}>
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>
                      No active contests found — try moving the map around
                    </Text>
                  </View>
                </View>
              )
            }
          </MapView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.Background,
  },

  container: {
    flex: 1,
    alignSelf: 'stretch',
  },

  map: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },

  shadow: {
    backgroundColor: Colors.Transparent,
    shadowColor: Colors.Overlay,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: {
      height: Sizes.InnerFrame / 2,
      width: 0
    }
  },

  textContainer: {
    marginBottom: Sizes.OuterFrame * 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.InnerFrame * 2,
    paddingTop: Sizes.InnerFrame / 2,
    paddingBottom: Sizes.InnerFrame / 2,
    backgroundColor: Colors.Foreground,
    borderRadius: 18
  },

  text: {
    color: Colors.Text,
    fontSize: Sizes.Text
  }
});

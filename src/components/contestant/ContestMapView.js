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
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import ContestMapMarker from './ContestMapMarker';
import HeaderButtons from '../common/HeaderButtons';
import HeaderButton from '../common/HeaderButton';

const LAT_DELTA = 0.01;
const LNG_DELTA = 0.01;

export default class ContestMapView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {},
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
            + this.state.region.latitudeDelta / 4,
          this.state.region.longitude
            + this.state.region.longitudeDelta / 4
        ]
      )
    });

    this.profileRef = Database.ref(
      `profiles/${
        Firebase.auth().currentUser.uid
      }`
    );

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
          region.latitude + region.latitudeDelta / 4,
          region.longitude + region.longitudeDelta / 4
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

      // helps trigger initial load
      this.setState({
        updated: true
      });
    });

    // remove when out of view
    this.ref.on('key_exited', (key, location, distance) => {
      delete this.state.inView[key];
    });

    // for HeaderButtons
    this.profileListener = this.profileRef.on('value', data => {
      if (data.exists()) {
        this.setState({
          profile: data.val()
        });
      }
    });
  }

  componentWillUnmount() {
    this.ref.cancel();
    this.profileListener && this.profileRef.off('value', this.profileListener);
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
          <HeaderButtons>
            <HeaderButton
              icon='camera-retro'
              onPress={Actions.entries}
              unread={
                this.state.profile.entries
                && Object.keys(this.state.profile.entries).length
                || 0
              } />
            <View style={styles.winningsContainer}>
              <FontAwesomeIcon
                name='trophy'
                color={Colors.Text} />
              <Text style={styles.winnings}>
                {
                  `$${
                    this.state.profile.wallet
                    || 0
                  }`
                }
              </Text>
            </View>
          </HeaderButtons>
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
  },

  winningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Sizes.InnerFrame / 2,
    marginLeft: Sizes.InnerFrame,
    backgroundColor: Colors.Primary,
    borderRadius: 14
  },

  winnings: {
    marginLeft: Sizes.InnerFrame / 4,
    fontWeight: '700',
    color: Colors.Text
  }
});

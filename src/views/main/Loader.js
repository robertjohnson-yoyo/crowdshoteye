import React, {
  Component
} from 'react';
import {
  View, ActivityIndicator, StyleSheet, StatusBar, Alert
} from 'react-native';
import {
  Actions
} from 'react-native-router-flux';
import {
  Colors
} from '../../Const';
import * as Firebase from 'firebase';

/**
 * Handles logging in and redirection to an appropriate View
 * either on app launch or after a login/registration was processed.
 */
export default class Loader extends Component {
  componentDidMount() {

    // handle currently logged in user
    Firebase.auth().onAuthStateChanged(user => {
      if (user) Actions.main(); else Actions.login();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          animating
          size='large'
          color={Colors.Text} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Primary
  }
});
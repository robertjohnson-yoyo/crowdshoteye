import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Navigator, Platform, StatusBar
} from 'react-native';
import {
  Router, Scene
} from 'react-native-router-flux';
import {
  Colors
} from './Const';
import * as Firebase from 'firebase';
import Database from './utils/Database';
import FCM from 'react-native-fcm';

// views
import Loader from './views/main/Loader';
import Login from './views/main/Login';
import Main from './views/main/Main';
import Contestant from './views/main/Contestant';
import NewContest from './views/forms/NewContest';
import Modal from './Modal';
import Profile from './views/profiles/Profile';
import ContestPhotos from './views/contests/ContestPhotos';
import ContestDetail from './views/contestant/ContestDetail';
import Chat from './views/main/Chat';
import Settings from './views/main/Settings';
import PaymentMethods from './views/forms/PaymentMethods';
import NewPaymentMethod from './views/forms/NewPaymentMethod';
import NewPayment from './views/forms/NewPayment';
import MapMarkerDrop from './views/forms/MapMarkerDrop';
import NewReferencePhoto from './views/forms/NewReferencePhoto';
import Contest from './views/contests/Contest';
import Entries from './views/contestant/Entries';
import TextEntry from './views/forms/TextEntry';
import CompletedContests from './views/contests/CompletedContests';
import PurchasedPhoto from './views/contests/PurchasedPhoto';

// components
import TabButton from './components/common/TabButton';

export default class Navigation extends Component {
  componentDidMount() {
    Platform.OS === 'ios' && StatusBar.setBarStyle('light-content', true);

    // initialize FCM
    FCM.requestPermissions();
    FCM.getFCMToken().then(token => {
      updateFCMToken(token);
    });
    this.token = FCM.on('refreshToken', token => {
      updateFCMToken(token);
    });

    // FCM listeners
    this.notification = FCM.on('notification', n => {
      console.log(n);
    });
  }

  componentWillUnmount() {
    this.token();
    this.notification();
  }

  render() {
    return (
      <View style={styles.container}>
        <Router>
          <Scene
            hideNavBar
            key='root'>
            <Scene
              initial
              key='loader'
              component={Loader}
              type='replace' />
            <Scene
              key='login'
              component={Login}
              type='replace' />
            <Scene
              key='modal'
              component={Modal} />
            <Scene
              key='profile'
              component={Profile} />
            <Scene
              key='contestPhotos'
              panHandlers={null}
              component={ContestPhotos} />
            <Scene
              key='contestDetail'
              panHandlers={null}
              direction='vertical'
              component={ContestDetail} />
            <Scene
              key='chat'
              component={Chat} />
            <Scene
              key='settings'
              component={Settings} />
            <Scene
              key='paymentMethods'
              component={PaymentMethods} />
            <Scene
              key='newPaymentMethod'
              component={NewPaymentMethod} />
            <Scene
              key='newPayment'
              component={NewPayment} />
            <Scene
              key='mapMarkerDrop'
              component={MapMarkerDrop} />
            <Scene
              key='newReferencePhoto'
              component={NewReferencePhoto} />
            <Scene
              key='entries'
              component={Entries} />
            <Scene
              key='contest'
              component={Contest} />
            <Scene
              key='textEntry'
              component={TextEntry} />
            <Scene
              key='completed'
              component={CompletedContests} />
            <Scene
              key='purchasedPhoto'
              component={PurchasedPhoto}
              panHandlers={null}
              direction='vertical' />
            <Scene
              tabs
              tabBarStyle={styles.tabs}
              key='main'
              type='replace'>
              <Scene
                initial
                hideNavBar
                key='mainMain'
                component={Main}
                title='Home'
                iconName='home'
                icon={TabButton} />
              <Scene
                hideNavBar
                key='mainBroadcast'
                component={NewContest}
                title='Start a Contest'
                iconName='casino'
                icon={TabButton} />
              <Scene
                hideNavBar
                key='mainContestant'
                component={Contestant}
                title='Join a Contest'
                iconName='camera'
                icon={TabButton} />
            </Scene>
          </Scene>
        </Router>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background
  },

  nav: {
    backgroundColor: Colors.Primary
  },

  navText: {
    color: Colors.Text
  },

  navButtons: {
    tintColor: Colors.Text
  },

  tabs: {
    backgroundColor: Colors.Foreground
  }
});

export function updateFCMToken(token) {

  // only update when logged in
  let user = Firebase.auth().currentUser;
  if (user) {
    Database.ref(
      `profiles/${
        user.uid
      }/fcm`
    ).set(token);
  }
}

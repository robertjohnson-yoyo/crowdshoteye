import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, Platform, StatusBar, BackAndroid
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import * as Firebase from 'firebase';
import Database from '../../utils/Database';
import {
  Actions
} from 'react-native-router-flux';

// components
import TitleBar from '../../components/common/TitleBar';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';
import CameraView from '../../components/common/CameraView';

export default class NewReferencePhoto extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    StatusBar.setHidden(true, 'slide');
    this.back = () => {
      StatusBar.setHidden(false, 'slide');
      Actions.pop();
      return true;
    };
    BackAndroid.addEventListener('hardwareBackPress', this.back);
  }

  componentWillUnmount() {
    // reset back to normal
    this.back && BackAndroid.removeEventListener('hardwareBackPress', this.back);
  }

  close() {
    StatusBar.setHidden(false, 'slide');
    Actions.pop();
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar title={
          this.props.title || 'Take a Photo of the Subject'
        } />
        <View style={styles.content}>
          <CameraView
            onUploaded={photoId => {

              // out
              Actions.pop();

              // outer callback
              this.props.onTaken && this.props.onTaken(
                photoId
              );
            }} />
        </View>
        <CloseFullscreenButton
          hide={Platform.OS !== 'ios'}
          back={!this.props.closeAction}
          action={this.props.closeAction} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background
  },

  content: {
    flex: 1
  }
});

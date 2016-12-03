import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, Alert
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import {
  Actions
} from 'react-native-router-flux';
import Database from '../../utils/Database';

// components
import Photo from '../common/Photo';
import Button from '../common/Button';
import UserSummary from '../profiles/UserSummary';
import OutlineText from '../common/OutlineText';
import CircleIcon from '../common/CircleIcon';

export default class ContestPhotoCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    Database.ref(
      `entries/${
        this.props.contestId
      }/${
        this.props.entryId
      }`
    ).once('value', data => {
      if (data.exists()) {
        this.setState({
          ...data.val()
        });
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Photo
          photoId={this.state.photoId}
          style={styles.photo}>
          <View style={styles.statusContainer}>
            <Button
              style={styles.reportButton}
              container={styles.reportContainer}
              icon='warning'
              label='Report'
              onPress={() => Actions.report()}/>
            <View>
            <OutlineText
              style={styles.statusCounter}
              text={`${
                this.props.i || 1
              } of ${
                this.props.n || 1
              }`} />
            </View>
          </View>
          <UserSummary
            uid={this.state.createdBy} />
        </Photo>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    shadowColor: Colors.Overlay,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },

  photo: {
    padding: Sizes.InnerFrame,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: Sizes.Width / 1.15,
    height: Sizes.Width * 1.15,
    borderRadius: 15,
    overflow: 'hidden'
  },

  statusContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between'
  },

  statusCounter: {
    marginLeft: Sizes.InnerFrame / 2
  },

  reportContainer: {
    marginTop: Sizes.InnerFrame / 8
  },

  reportButton: {
    backgroundColor: Colors.Transparent
  }

});

import React, {
  Component
} from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import {
  Actions
} from 'react-native-router-flux';

import Database from '../../utils/Database';
import Photo from '../common/Photo';
import CircleIconInfo from '../common/CircleIconInfo';

export default class ChatCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contest: {}
    }

    this.ref = Database.ref(
      `contests/${
        this.props.chatId
      }`
    )
  };

    componentDidMount() {
      this.listenser = this.ref.on('value', data => {
        if (data.exists()) {
          this.setState({
            ...data.val()
          });
        }
      });
    }

  componentWillUnmount() {
    this.listener && this.ref.off('value', this.listener);
  }

  render() {
    return(
      <View style={styles.outline}>
        <TouchableOpacity
          onPress={() => Actions.chat({
            chatId: this.props.chatId,
            title: 'Contest Chat'
          })}>
          <View style={styles.item}>
            <Photo
              photoId={this.state.referencePhotoId}
              style={styles.photo} />
            <Text>
              Chat Preview
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outline: {
    alignSelf: 'stretch',
    borderLeftWidth: Sizes.InnerFrame / 4,
    borderLeftColor: Colors.ModalForeground,
    backgroundColor: Colors.ModalForeground
  },

  photo: {
    width: 50,
    height: 50,
    borderRadius: 5
  },

  item: {
    padding: Sizes.InnerFrame,
    paddingLeft: Sizes.InnerFrame,
    backgroundColor: Colors.ModalForeground,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between'
  }
})
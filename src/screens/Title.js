import React, { Component } from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { Icon } from 'react-native-elements'
import { Actions } from 'react-native-router-flux';

const styles = {
  pageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  fontStyle: {
    fontSize: 36,
    fontWeight: '600'
  }
}

class Title extends Component {
  render() {
    return (
      <View style={styles.pageStyle}>
        <Text style={styles.fontStyle}>元気な人選手権</Text>
        <Icon name='rowing' />
        <TouchableOpacity
          style={styles.startButton}
          onPress={Actions.play}
        >
          <Text style={styles.buttonText}>{'始める'}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default Title;
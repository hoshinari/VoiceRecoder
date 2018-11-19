import React, { Component } from 'react';
import { View, Text, TouchableOpacity,PermissionsAndroid,Platform} from 'react-native';
import { Icon } from 'react-native-elements'
import { Actions } from 'react-native-router-flux';
import { AudioRecorder, AudioUtils } from 'react-native-audio'
import Promise from 'bluebird'
import Sound from 'react-native-sound'
import flow from 'lodash/flow'
import { is, some, digger } from '../functions'


const styles = {
  pageStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  fontStyle: {
    fontSize: 36,
    fontWeight: '600'
  },
  container: {
    padding: 20,
  },
  button: {
    padding: 10,
    paddingHorizontal: 20,
  }
}


class Play extends Component {
  static defaultProps = {
    audioPath: AudioUtils.DocumentDirectoryPath + 'voice.aac'
  }
  
  constructor (props) {
    super(props)
    this.handleStart = this.handleStart.bind(this)
    console.log(this)
    this.handleStop = this.handleStop.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.state = {
      recording: false,
      recordingTime: 0,
      recorded: false,
      playbacking: false,
    }
  }
  
  async requestPermission () {
    const rationale = {
      'title': 'Microphone Permission',
      'message': 'ReactNativeKitchenSink needs access to your microphone so you can record audio.'
    }
    const isOK = some(true, PermissionsAndroid.RESULTS.GRANTED)
  
    return Platform.select({
      ios: () => Promise.resolve(true),
      android: () => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale).then(isOK),
    })
  }
  
  async setUp () {
    const options = {
      SampleRate: 22050,    // CDと同じ
      Channels: 1,          // モノラル
      AudioQuality: 'Low',  // 
      AudioEncoding: 'aac', // iOS/Android両対応のフォーマット
    }
  
    console.log(this.props.audioPath)
    console.log(options)
    return AudioRecorder.prepareRecordingAtPath(this.props.audioPath, options)
  }
  
  async record () {
    console.log("recode")
    return await AudioRecorder.startRecording()
  }
  
  async tearDown (success) {
    this.setState({ recording: false, recorded: success, recordingTime: 0 })
  }
  
  async preview () {
    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    return new Promise(async (resolve, reject) => {
      await Promise.delay(100)
      const sound = new Sound(this.props.audioPath, '', e => e && reject(e))
      await Promise.delay(100)
      sound.play(ok => ok ? resolve() : reject(new Error('Playback failed')))
    })
  }
  
  async handleStart () {
    try {
      if (!await this.requestPermission()) {
        alert('TODO: Handle permission denied')
      }
  
      await this.setUp()
      await this.record()
      this.setState({ recording: true, recorded: false, recordingTime: 0 })
    } catch (e) {
      console.error(e)
    }
  }
  
  async handleStop () {
    if (!this.state.recording) {
      return
    }
  
    const filePath = await AudioRecorder.stopRecording()
    if (Platform.OS === 'android') {
      await this.tearDown(true, filePath)
    }
  }
  
  async handlePreview () {
    if (!this.state.recorded) {
      return
    }
  
    this.setState({ playbacking: true })
    await this.preview()
    this.setState({ playbacking: false })
  }
  
  componentDidMount () {
    const isOK = flow(digger('status'), is('OK'))
    AudioRecorder.onFinished = (data) => {
      if (Platform.OS !== 'ios') {
        return
      }
      this.tearDown(isOK(data))
    }
    AudioRecorder.onProgress = ({ currentTime }) => {
      this.setState({ recordingTime: Math.floor(currentTime) })
    }
  }
  
  render() {
    return (
      <View style={styles.pageStyle}>
        <Text style={styles.fontStyle}>プレイ場面</Text>
        <Icon name='rowing' />
        <TouchableOpacity
          style={styles.startButton}
          onPress={Actions.play}
        >
          <Text>{'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={this.handleStart}
        >
          <Text>{'録音を開始する'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={this.handleStop}
        >
          <Text>{'録音を終了する'}</Text>
        </TouchableOpacity>
        {this.state.recorded
          ? (
            <TouchableOpacity
              style={styles.button}
              onPress={this.handlePreview}
            >
              <Text>{'録音した音声を確認する'}</Text>
            </TouchableOpacity>
          )
          : null}

        <Text>State:</Text>
        <Text>{JSON.stringify(this.state, null, 2)}</Text>
      </View>
    )
  }
}

export default Play;
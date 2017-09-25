import {
  AppRegistry,
  Button,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import React, { Component } from 'react';

import DeckSwiper from './DeckSwiper';
import FastImage from 'react-native-fast-image';
import Swiper from 'react-native-deck-swiper';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      toggleRender: 0,
    };
  }

  renderCard = (item) => (
    <View style={{ flex: 1, backgroundColor: 'red', alignItems: 'center' }}>
      <Image
        style={{ flex: 1, width: 100, aspectRatio: 0.5, height: undefined, resizeMode: 'cover', backgroundColor: 'red' }}
        source={{ uri: item.uri }}
      />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ backgroundColor: 'transparent', fontSize: 100, color: 'yellow' }}>{item.id}</Text>
      </View>
    </View>
  )

  render() {
    const cards = [
      { id: 1, uri: 'https://unsplash.it/1000/?image=10' },
      { id: 2, uri: 'https://unsplash.it/1000/?image=20' },
      { id: 3, uri: 'https://unsplash.it/1000/?image=30' },
      { id: 4, uri: 'https://unsplash.it/1000/?image=40' },
      { id: 5, uri: 'https://unsplash.it/1000/?image=50' },
    ];

    const cards2 = [
      { id: 10, uri: 'https://unsplash.it/1000/?image=100' },
      { id: 20, uri: 'https://unsplash.it/1000/?image=200' },
      { id: 30, uri: 'https://unsplash.it/1000/?image=300' },
      { id: 40, uri: 'https://unsplash.it/1000/?image=400' },
      { id: 50, uri: 'https://unsplash.it/1000/?image=500' },
    ];

    return (
      <View style={{ flex: 1, marginTop: 20 }}>
        <DeckSwiper
          ref={(swiper) => { this.Swiper = swiper; }}
          dataSource={this.state.index % 2 === 0 ? cards : cards2}
          renderCard={this.renderCard}
        />
        <View style={{ flex: 1, marginTop: 30, borderWidth: 5, borderColor: 'red' }}>
          <Button
            title={'Swipe Right'}
            onPress={() => { this.Swiper.swipeRight(); }}
          />
          <Button
            title={'Swipe Left'}
            onPress={() => { this.Swiper.swipeLeft(); }}
          />
          <Button
            title={'Update dataSource'}
            onPress={() => { this.setState({ index: this.state.index + 1 }); }}
          />
          <Button
            title={'re-render'}
            onPress={() => { this.setState({ toggleRender: this.state.toggleRender + 1 }); }}
          />
          <Text style={{ textAlign: 'center' }}>{this.state.toggleRender}</Text>
        </View>
      </View>
    );
  }
}
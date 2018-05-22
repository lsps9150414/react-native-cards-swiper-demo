import {
  AppRegistry,
  Button,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import React, { Component } from 'react';

import CardSwiper from 'react-native-cards-swiper';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      toggleRender: 0,
    };
  }

  cards = [
    { id: 1, uri: 'https://unsplash.it/2000/?image=10' },
    { id: 2, uri: 'https://unsplash.it/2000/?image=20' },
    { id: 3, uri: 'https://unsplash.it/2000/?image=30' },
    { id: 4, uri: 'https://unsplash.it/2000/?image=40' },
    { id: 5, uri: 'https://unsplash.it/2000/?image=50' },
  ];

  cards2 = [
    { id: 10, uri: 'https://unsplash.it/2000/?image=100' },
    { id: 20, uri: 'https://unsplash.it/2000/?image=200' },
    { id: 30, uri: 'https://unsplash.it/2000/?image=300' },
    { id: 40, uri: 'https://unsplash.it/2000/?image=400' },
    { id: 50, uri: 'https://unsplash.it/2000/?image=500' },
  ];

  renderCard = (item) => (
    <View style={{ flex: 1, alignItems: 'center', alignSelf: 'center' }}>
      <Image
        style={{ flex: 1, aspectRatio: 1, width: undefined, height: undefined, resizeMode: 'cover', backgroundColor: 'black' }}
        source={{ uri: item.uri }}
      />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ backgroundColor: 'transparent', fontSize: 100, color: 'yellow' }}>{item.id}</Text>
      </View>
    </View>
  )

  render() {


    return (
      <View style={{ flex: 1, marginTop: 20 }}>
        <CardSwiper
          ref={(swiper) => { this.Swiper = swiper; }}
          data={this.state.index % 2 === 0 ? this.cards : this.cards2}
          renderCard={this.renderCard}
          containerStyle={{ flex: 1, zIndex: 99, borderWidth: 2, borderColor: 'gray', margin: 10, padding: 10 }}
          swipeThresholdDistanceFactor={0.25}
          enableFillContainer
        />
        <View style={{ marginTop: 20 }}>
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
        </View>
      </View>
    );
  }
}
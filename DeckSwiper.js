import {
  Animated,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import _ from 'lodash';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;
const PRELOAD_CARDS = 2;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    borderWidth: 5,
    borderColor: 'pink',
  },
  cardContainer: {
    flex: 1,
    position: 'absolute',
    borderWidth: 5,
    borderColor: 'blue',
    // width: SCREEN_WIDTH,
  }
});

const propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.any.isRequired,
  })).isRequired,
  renderCard: PropTypes.func.isRequired,
  renderSwipedAll: PropTypes.func,
};

const defaultProps = {
  onSwipeRight: () => { },
  onSwipeLeft: () => { },
};

class DeckSwiper extends Component {
  constructor(props) {
    super(props);
    this.position = new Animated.ValueXY();
    this.initPanResponder(this.position);
    this.state = {
      currentCardIndex: 0,
      containerLayout: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.dataSource, this.props.dataSource)) {
      this.setState({ currentCardIndex: 0 });
    }
  }

  initPanResponder(position) {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });
  }

  swipeRight() {
    this.forceSwipe('right');
  }

  swipeLeft() {
    this.forceSwipe('left');
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, dataSource } = this.props;
    const item = dataSource[this.state.currentCardIndex];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.position.setValue({ x: 0, y: 0 });
    this.setState({ currentCardIndex: this.state.currentCardIndex + 1 });
  }

  resetPosition() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  updateContainerLayout = ({ nativeEvent }) => {
    this.setState({ containerLayout: nativeEvent.layout });
  }

  getCardLayoutStyles() {
    console.log(this.state.containerLayout.width);
    const containerBorderWidth = StyleSheet.flatten(styles.container).borderWidth || 0;
    return ({
      width: this.state.containerLayout.width - containerBorderWidth * 2,
      // height: this.containerLayout.height,
    });
  }

  getCardAnimatedStyles() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return ({
      ...this.position.getLayout(),
      transform: [{ rotate }]
    });
  }

  getNextCardAnimatedStyles(i) {
    if (i === this.state.currentCardIndex + 1) {
      const scale = this.position.x.interpolate({
        inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
        outputRange: [1, 0.95, 1]
      });
      return ({
        transform: [{ scale }],
      })
    }
    return null;
  }

  renderCards() {
    if (this.state.currentCardIndex >= this.props.dataSource.length) {
      return this.props.renderSwipedAll ? this.props.renderSwipedAll() : (
        <View>
          <Text>No more cards</Text>
        </View>
      );
    }

    return this.props.dataSource.map((item, i) => {
      if (i < this.state.currentCardIndex) {
        return null;
      } else if (i === this.state.currentCardIndex) {
        return (
          <Animated.View
            key={item.id}
            style={[styles.cardContainer, this.getCardLayoutStyles(), this.getCardAnimatedStyles(), { zIndex: 99 }]}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      } else if (i < this.state.currentCardIndex + PRELOAD_CARDS) {
        return (
          <Animated.View
            key={item.id}
            style={[styles.cardContainer, this.getCardLayoutStyles(), this.getNextCardAnimatedStyles(i)]}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      } else {
        return null;
      }
    }).reverse();
  }

  render() {
    return (
      <View style={styles.container} onLayout={this.updateContainerLayout}>
        {this.renderCards()}
      </View>
    );
  }
}

DeckSwiper.propTypes = propTypes;
DeckSwiper.defaultProps = defaultProps;

export default DeckSwiper;
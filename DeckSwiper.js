import {
  Animated,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  StyleSheet,
  Text,
  UIManager,
  View,
  ViewPropTypes,
} from 'react-native';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import _ from 'lodash';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;
const PRELOAD_CARDS = 3;

const styles = StyleSheet.create({
  container: {
  },
  cardContainer: {
    flex: 1,
    position: 'absolute',
  },
  swipedAllContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.any.isRequired,
  })).isRequired,
  renderCard: PropTypes.func.isRequired,
  renderSwipedAll: PropTypes.func,
  containerStyle: ViewPropTypes.style,
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
      cardLayout: {},
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

  setContainerRef = (ref) => {
    this.Container = ref;
  }

  setCardRef = (ref) => {
    this.Card = ref;
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

  updateCardLayout = ({ nativeEvent }) => {
    this.setState({ cardLayout: nativeEvent.layout });
  }

  getContainerHeightStyle() {
    const flattenContainerStyle = StyleSheet.flatten(this.props.containerStyle);
    const containerBorderWidth = (flattenContainerStyle.borderWidth || 0) + (flattenContainerStyle.padding || 0);
    return ({
      height: this.state.cardLayout.height + containerBorderWidth * 2,
    });
  }

  getCardLayoutStyles() {
    const flattenContainerStyle = StyleSheet.flatten(this.props.containerStyle);
    const containerBorderWidth = flattenContainerStyle.borderWidth || 0;
    const containerPadding = flattenContainerStyle.padding || 0;
    const containerPaddingTop = flattenContainerStyle.paddingTop !== undefined ? flattenContainerStyle.paddingTop : containerPadding;
    const containerPaddingLeft = flattenContainerStyle.paddingLeft !== undefined ? flattenContainerStyle.paddingLeft : containerPadding;
    const containerPaddingRight = flattenContainerStyle.paddingRight !== undefined ? flattenContainerStyle.paddingRight : containerPadding;
    const actualPadding = containerPaddingLeft + containerPaddingRight;
    const offset = containerBorderWidth * 2 + actualPadding;

    return ({
      width: this.state.containerLayout.width - offset,
      marginLeft: containerPaddingLeft,
      marginTop: containerPaddingTop,
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

  getBackgroundCardAnimatedStyles(i) {
    if (i === this.state.currentCardIndex + 1) {
      const scale = this.position.x.interpolate({
        inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
        outputRange: [1, 0.95, 1]
      });
      return ({
        transform: [{ scale }],
      })
    }
    return ({ opacity: 0 });
  }

  renderSwipedAll = () => {
    return this.props.renderSwipedAll ? this.props.renderSwipedAll() : (
      <View style={styles.swipedAllContainer}>
        <Text>No more cards</Text>
      </View>
    );
  }

  renderCards() {
    if (this.state.currentCardIndex >= this.props.dataSource.length) {
      return this.renderSwipedAll();
    }

    return this.props.dataSource.map((item, i) => {
      if (i < this.state.currentCardIndex) {
        return null;
      } else if (i === this.state.currentCardIndex) {
        return (
          <Animated.View
            ref={this.setCardRef}
            key={item.id}
            style={[
              styles.cardContainer,
              this.getCardLayoutStyles(),
              this.getCardAnimatedStyles(),
              { zIndex: 99 },
            ]}
            onLayout={this.updateCardLayout}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      } else if (i < this.state.currentCardIndex + PRELOAD_CARDS) {
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardContainer,
              this.getCardLayoutStyles(),
              this.getBackgroundCardAnimatedStyles(i),
            ]}
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
      <View
        ref={this.setContainerRef}
        style={[
          styles.container,
          this.getContainerHeightStyle(),
          this.props.containerStyle,
        ]}
        onLayout={this.updateContainerLayout}
      >
        {this.renderCards()}
      </View>
    );
  }
}

DeckSwiper.propTypes = propTypes;
DeckSwiper.defaultProps = defaultProps;

export default DeckSwiper;
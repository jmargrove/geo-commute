import React, { Component } from "react";
import {
  Platform,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import styled from "styled-components";
import { MapView, Location, Permissions } from "expo";
import { Marker, Polyline } from "react-native-maps";

const Container = styled(View)`
  flex: 1;
  background-color: blue;
  ${({ color }) => color && `background-color: ${color}`}
`;

const MapContainer = styled(View)`
  flex: 5;
`;

const ControlContainer = styled(View)`
  flex: 1
  background-color: grey;
  align-items: center;
  justify-content: space-around;
  flex-direction: row;
`;

const ButtonContainer = styled(TouchableOpacity)`
  width: 100;
  height: 75;
  border-radius: 25;
  background-color: yellow;
  border: solid;
  justify-content: center;
  align-items: center;
`;

const SendButton = ({
  user,
  coords,
  handleBuddieResponse,
  handleGroupColor,
  handleEndWait,
  handleShowWait,
  handleMidPoint,
  handleDist
}) => {
  return (
    <ButtonContainer
      onPress={() => {
        handleShowWait();
        fetch("http://172.20.10.8:8080/send", {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user, coords })
        }).then(resp => {
          handleEndWait();
          handleDist(JSON.parse(resp._bodyInit).dist);
          handleGroupColor(JSON.parse(resp._bodyInit).color);
          handleBuddieResponse(JSON.parse(resp._bodyInit).users);
          handleMidPoint(JSON.parse(resp._bodyInit).center);
        });
      }}
    >
      <Text style={{ fontSize: 25 }}>Join</Text>
    </ButtonContainer>
  );
};

const ResultButton = ({ handleShowGroupColor }) => {
  return (
    <ButtonContainer onPress={() => handleShowGroupColor()}>
      <Text style={{ fontSize: 25 }}>Buddies</Text>
    </ButtonContainer>
  );
};

const Map = styled(MapView)`
  flex: 1;
`;

const UserMarker = styled(Marker)`
  width: 20;
  height: 20;
  border-radius: 10;
  ${({ color }) =>
    color ? `background-color: ${color}` : `background-color: black`}
  border: solid;
`;

const BeekeeperCoordinates = {
  latitude: 47.392399,
  longitude: 8.524558
};

const WorkMarker = styled(Marker)`
  width: 20;
  height: 20;
  border-radius: 10;
  background-color: yellow;
  border: solid;
`;

const WaitScreenContainer = styled(View)`
  background-color: rgba(0,0,0, 0.8)
  z-index: 5;
  position: absolute;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const WaitScreen = () => {
  return (
    <WaitScreenContainer>
      <View>
        <ActivityIndicator size={0} color="white" />
        <View style={{ height: 50 }} />
        <Text style={{ color: "white" }}>
          Calculating your commute buddies.
        </Text>
      </View>
    </WaitScreenContainer>
  );
};

const InfoBoxContainer = styled(View)`
  width: 300;
  height: 200;
  border: solid;
  background-color: lightgrey;
  position: absolute;
  top: 25;
  left: 25;
  z-index: 5;
`;

const CloseButton = styled(TouchableOpacity)`
  width: 30;
  height: 30;
  background-color: black;
`;
const InfoBox = ({ handleCloseInfo }) => {
  return (
    <InfoBoxContainer>
      <CloseButton onPress={handleCloseInfo} />
      <Text>Use the blakc marker to choose your pickup point! :)</Text>
    </InfoBoxContainer>
  );
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      location: {
        coords: {
          latitude: 47.392399,
          longitude: 8.524558
        }
      },
      buddies: null,
      groupColor: null,
      toggleColor: false,
      toggleWait: false,
      center: null,
      dist: null,
      toggleInfo: true
    };
  }

  handleCloseInfo = () => {
    this.setState({ toggleInfo: false });
  };

  handleShowGroupColor = () => {
    this.setState({
      toggleColor: true
    });
  };

  handleMidPoint = center => {
    this.setState({ center: center });
  };
  handleRmGroupColor = () => {
    this.setState({
      toggleColor: false
    });
  };

  handleDist = dist => {
    this.setState({ dist: dist });
  };
  handleShowWait = () => {
    this.setState({ toggleWait: true });
  };

  handleEndWait = () => {
    this.setState({ toggleWait: false });
  };

  handleBuddieResponse = buddieCoords => {
    this.setState({ buddies: buddieCoords });
  };

  handleGroupColor = color => {
    this.setState({ groupColor: color });
  };

  componentWillMount() {
    if (Platform.OS === "android" && !Constants.isDevice) {
      this.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location: location });
  };

  render() {
    if (!this.state.location) {
      return <Container />;
    } else if (this.state.toggleColor) {
      return (
        <TouchableOpacity
          onPress={() => this.handleRmGroupColor()}
          style={{
            flex: 1,
            backgroundColor: this.state.groupColor,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={{ fontSize: 150 }}>:)</Text>
          <View style={{ height: 30 }} />
          <Text style={{ fontSize: 20 }}>
            You {this.state.groupColor}, go find them.
          </Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <Container>
          {this.state.toggleWait && <WaitScreen />}
          {this.state.toggleInfo && (
            <InfoBox handleCloseInfo={this.handleCloseInfo} />
          )}
          <MapContainer>
            <Map
              onPress={e =>
                this.setState({
                  location: { coords: e.nativeEvent.coordinate }
                })
              }
              initialRegion={{
                latitude: this.state.center
                  ? this.state.center.coords.latitude
                  : this.state.location.coords.latitude,
                longitude: this.state.center
                  ? this.state.center.coords.longitude
                  : this.state.location.coords.longitude,
                latitudeDelta: this.state.dist ? this.state.dist : 0.0922,
                longitudeDelta: this.state.dist ? this.state.dist / 2 : 0.0421
              }}
            >
              {!this.state.buddies && (
                <Marker
                  draggable
                  onDragEnd={e =>
                    this.setState({
                      location: { coords: { ...e.nativeEvent.coordinate } }
                    })
                  }
                  coordinate={this.state.location.coords}
                >
                  <UserMarker coordinate={this.state.location.coords} />
                </Marker>
              )}
              {this.state.buddies &&
                this.state.buddies.map((el, i) => {
                  if (i < 4) {
                    return (
                      <Marker key={i} coordinate={el.coords}>
                        <UserMarker
                          coordinate={el.coords}
                          color={this.state.groupColor}
                        />
                      </Marker>
                    );
                  }
                })}
              {
                <Polyline
                  coordinates={
                    this.state.buddies &&
                    this.state.buddies.reduce((acc, el) => {
                      acc.push(el.coords);
                      return acc;
                    }, [])
                  }
                />
              }

              <Marker coordinate={BeekeeperCoordinates}>
                <WorkMarker coordinate={BeekeeperCoordinates} />
              </Marker>
            </Map>
          </MapContainer>
          <ControlContainer>
            <SendButton
              user={"37824"}
              coords={this.state.location}
              handleBuddieResponse={this.handleBuddieResponse}
              handleGroupColor={this.handleGroupColor}
              handleEndWait={this.handleEndWait}
              handleShowWait={this.handleShowWait}
              handleMidPoint={this.handleMidPoint}
              handleDist={this.handleDist}
            />
            {this.state.buddies && (
              <ResultButton handleShowGroupColor={this.handleShowGroupColor} />
            )}
          </ControlContainer>
        </Container>
      );
    }
  }
}

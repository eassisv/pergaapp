/* eslint-disable react/prop-types */
import React from "react";
import { View, ActivityIndicator, AsyncStorage } from "react-native";
import { createSwitchNavigator, createAppContainer } from "react-navigation";
import SignInScreen from "./views/SignInScreen";
import HomeScreen from "./views/HomeScreen";

class AuthLoadingScreen extends React.Component {
  async componentDidMount() {
    this.bootstrapAsync();
  }

  async bootstrapAsync() {
    const { navigation } = this.props;
    const user = await AsyncStorage.getItem("user");
    const password = await AsyncStorage.getItem("password");
    if (user !== null && password !== null)
      navigation.navigate("Home", { user, password });
    else {
      navigation.navigate("SignIn");
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size={40} color="#ddd" />
      </View>
    );
  }
}

const AppNavigator = createSwitchNavigator(
  {
    Auth: AuthLoadingScreen,
    Home: {
      screen: HomeScreen
    },
    SignIn: SignInScreen
  },
  { initialRouteName: "Auth" }
);

export default createAppContainer(AppNavigator);

/* eslint-disable react/prop-types */
import React from "react";
import { View, StyleSheet } from "react-native";
import { Input, Button } from "react-native-elements";

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: "", password: "" };
  }

  userChangeHandle(input) {
    if (input.length <= 20) this.setState({ user: input });
  }

  passwordChangeHandle(input) {
    if (input.length <= 20) this.setState({ password: input });
  }

  render() {
    const { user, password } = this.state;
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        <Input
          containerStyle={styles.input}
          placeholder="matrícula"
          keyboardType="number-pad"
          // disabled={loading}
          value={user}
          onChangeText={input => this.userChangeHandle(input)}
        />
        <Input
          containerStyle={styles.input}
          placeholder="senha"
          keyboardType="number-pad"
          autoCompleteType="password"
          secureTextEntry
          // disabled={loading}
          value={password}
          onChangeText={input => this.passwordChangeHandle(input)}
        />
        <Button
          containerStyle={styles.button}
          buttonStyle={{ backgroundColor: "#005f8f" }}
          title="renovar livros"
          // loading={loading}
          // disabled={loading}
          onPress={() => navigation.navigate("Home", { user, password })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: "10%"
  },
  input: { paddingVertical: 15 },
  button: { paddingVertical: 15, width: "94%" },
  text: {
    paddingTop: 10,
    paddingBottom: 30,
    fontSize: 20,
    color: "#555555",
    textAlign: "center"
  }
});

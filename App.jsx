import React from "react";
import { StyleSheet, View } from "react-native";
import { Input, Button } from "react-native-elements";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      password: "",
      loading: false
    };
  }

  userChangeHandle(text) {
    if (text.length > 20) return;
    this.setState({ user: text });
  }

  passwordChangeHandle(text) {
    if (text.length > 20) return;
    this.setState({ password: text });
  }

  buttonPressHandle() {}

  render() {
    const { user, password, loading } = this.state;

    return (
      <View style={styles.container}>
        <Input
          containerStyle={styles.input}
          placeholder="matricula"
          keyboardType="numeric"
          disabled={loading}
          value={user}
          onChangeText={text => this.userChangeHandle(text)}
        />
        <Input
          containerStyle={styles.input}
          placeholder="senha"
          keyboardType="numeric"
          disabled={loading}
          secureTextEntry
          value={password}
          onChangeText={text => this.passwordChangeHandle(text)}
        />
        <Button
          containerStyle={styles.button}
          title="renovar livros"
          loading={loading}
          disabled={loading}
          onPress={() => this.buttonPressHandle()}
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
  input: {
    paddingVertical: 15
  },
  button: {
    paddingVertical: 15,
    width: "94%"
  }
});

import React from "react";
import { StyleSheet, View } from "react-native";
import { Input, Button } from "react-native-elements";
import axios from "axios";

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

  async buttonPressHandle() {
    this.setState({ loading: true });
    const { user, password } = this.state;
    const pergaUrl = "http://consulta.uffs.edu.br/pergamum/biblioteca_s";

    try {
      const res = await axios.post(
        `${pergaUrl}/php/login_usu.php`,
        `login=1611100027&password=2410`,
        {
          headers: {
            Host: "consulta.uffs.edu.br",
            Referer:
              "http://consulta.uffs.edu.br/pergamum/biblioteca_s/php/login_usu.php?flag=index.php",
            "content-type": "application/x-www-form-urlencoded"
          }
        }
      );

      // TODO: id_codigoreduzido_anteriorPendente

      const weirdCode = res.data
        .match(
          '<input.*type="hidden".*id="id_codigoreduzido_anteriorPendente".*>'
        )
        .map(input => input.match("\\d+").join())
        .join();

      const booksUrl = res.data
        .match(RegExp('<input.*onclick="javascript:renova.*>', "g"))
        .map(
          input => input.match(RegExp("\\d+", "g"))
          // .join()
          // .split(RegExp("(,|',')"))
          // .filter(num => num.replace(RegExp("'", "g"), ""))
        )
        .map(
          args =>
            `index.php?rs=ajax_renova&rst=&rsrnd=${new Date().getTime()}&rsargs[]=${
              args[0]
            }&rsargs[]=${args[1]}&rsargs[]=${args[2]}&rsargs[]=${weirdCode}`
        );
    } catch (error) {
      console.log(error);
    }
    this.setState({ loading: false });
  }

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

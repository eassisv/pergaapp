import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Input, Button } from "react-native-elements";
import Modal from "react-native-modal";
import axios from "axios";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      password: "",
      modalMessage: "",
      loading: false
    };
  }

  setModalFeedback(message) {
    this.setState({
      loading: false,
      modalMessage: message
    });
  }

  passwordChangeHandle(text) {
    if (text.length > 20) return;
    this.setState({ password: text });
  }

  userChangeHandle(text) {
    if (text.length > 20) return;
    this.setState({ user: text });
  }

  async buttonPressHandle() {
    this.setState({ loading: true });
    const { user, password } = this.state;
    if (user === "" || password === "") {
      this.setModalFeedback("Digite a matrícula e a senha");
      return;
    }
    const baseUrl = "http://consulta.uffs.edu.br/pergamum/biblioteca_s";
    const loginUrl = `${baseUrl}/php/login_usu.php`;
    const indexUrl = `${baseUrl}/meu_pergamum/index.php`;
    const renewUrl = `${indexUrl}?rs=ajax_renova&rst=`;
    const logoutUrl = `${baseUrl}/meu_pergamum/logout.php`;
    let res;
    let booksUrl;
    try {
      // logging in
      res = await axios.post(loginUrl, `login=${user}&password=${password}`, {
        timeout: 60 * 1000, // wait a minute to connect
        headers: {
          Host: "consulta.uffs.edu.br",
          Referer: loginUrl,
          "content-type": "application/x-www-form-urlencoded"
        }
      });
    } catch (error) {
      this.setModalFeedback("Não conseguimos conectar com o site\n😧😧😧");
      return;
    }

    try {
      // strange code that is passed in a hidden input field
      const weirdCode = res.data
        .match(
          '<input.*type="hidden".*id="id_codigoreduzido_anteriorPendente".*>'
        )
        .map(input => input.match("\\d+").join())
        .join();
      // booksUrl is an array of urls with GET parameters to renew the books
      booksUrl = res.data
        .match(RegExp('<input.*onclick="javascript:renova.*>', "g"))
        .map(input => input.match(RegExp("\\d+", "g")))
        .map(
          args =>
            `${renewUrl}&rsrnd=${new Date().getTime()}&rsargs[]=
            ${args[0]}&rsargs[]=${args[1]}&rsargs[]=
            ${args[2]}&rsargs[]=${weirdCode}`
        );
    } catch (error) {
      this.setModalFeedback("Matrícula ou senha incorreta\n");
      return;
    }
    try {
      await axios.all(booksUrl.map(url => axios.get(url)));
      res = await axios.get(indexUrl);
      const returnDate = res.data.match("\\d+\\/\\d+\\/\\d+").join();
      await axios.get(logoutUrl);
      this.setModalFeedback(`Livros renovados até ${returnDate}\n😎🎊🎉`);
    } catch (error) {
      this.setModalFeedback(
        "Aconteceu um erro inesperado, você vai ter que acessar o site\n😢😢😢"
      );
    }
  }

  disableModal() {
    this.setState({ modalMessage: "" });
  }

  render() {
    const { user, password, loading, modalMessage } = this.state;
    return (
      <View style={styles.container}>
        <Modal
          animationIn="slideInDown"
          animationOut="slideOutUp"
          swipeDirection="up"
          onSwipeComplete={() => this.disableModal()}
          onBackdropPress={() => this.disableModal()}
          isVisible={modalMessage !== ""}
        >
          <View style={styles.content}>
            <Text style={styles.text}>{modalMessage}</Text>
            <Button
              title="fechar"
              type="clear"
              style={styles.button}
              onPress={() => this.disableModal()}
            />
          </View>
        </Modal>
        <Input
          containerStyle={styles.input}
          placeholder="matrícula"
          keyboardType="number-pad"
          disabled={loading}
          value={user}
          onChangeText={text => this.userChangeHandle(text)}
        />
        <Input
          containerStyle={styles.input}
          placeholder="senha"
          keyboardType="number-pad"
          autoCompleteType="password"
          disabled={loading}
          secureTextEntry
          value={password}
          onChangeText={text => this.passwordChangeHandle(text)}
        />
        <Button
          containerStyle={styles.button}
          buttonStyle={{ backgroundColor: "#005f8f" }}
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
  content: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 3
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

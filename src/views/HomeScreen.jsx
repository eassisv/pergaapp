/* eslint-disable react/prop-types */
import React from "react";
import { Text, StyleSheet, View, AsyncStorage, Dimensions } from "react-native";
import { Button, Input } from "react-native-elements";
import Modal from "react-native-modal";
import axios from "axios";

const baseUrl = "http://consulta.uffs.edu.br/pergamum/biblioteca_s";
const loginUrl = `${baseUrl}/php/login_usu.php`;
const indexUrl = `${baseUrl}/meu_pergamum/index.php`;
const renewUrl = `${indexUrl}?rs=ajax_renova&rst=`;
const logoutUrl = `${baseUrl}/meu_pergamum/logout.php`;

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      booksUrl: [],
      modalMessage: "",
      loading: false
    };
  }

  async componentDidMount() {
    let res;
    const { navigation } = this.props;
    const user = navigation.getParam("user");
    const password = navigation.getParam("password");
    if (user === null || password === null) {
      navigation.navigate("SignIn");
    }
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
      const booksUrl = res.data
        .match(RegExp('<input.*onclick="javascript:renova.*>', "g"))
        .map(input => input.match(RegExp("\\d+", "g")))
        .map(
          args =>
            `${renewUrl}&rsrnd=${new Date().getTime()}&rsargs[]=
          ${args[0]}&rsargs[]=${args[1]}&rsargs[]=
          ${args[2]}&rsargs[]=${weirdCode}`
        );

      this.setState({ booksUrl });
    } catch (error) {
      this.setModalFeedback("Matrícula ou senha incorreta\n");
    }
    await AsyncStorage.setItem("user", user);
    await AsyncStorage.setItem("password", password);
  }

  setModalFeedback(message) {
    this.setState({
      loading: false,
      modalMessage: message
    });
  }

  async buttonPressHandle() {
    this.setState({ loading: true });
    const { booksUrl } = this.state;
    try {
      await axios.all(booksUrl.map(url => axios.get(url)));
      const res = await axios.get(indexUrl);
      const returnDate = res.data.match("\\d+\\/\\d+\\/\\d+").join();

      this.setModalFeedback(`Livros renovados até ${returnDate}\n😎🎊🎉`);
    } catch (error) {
      this.setModalFeedback(
        "Aconteceu um erro inesperado, você vai ter que acessar o site\n😢😢😢"
      );
    }
  }

  async onLoggoutHandle() {
    this.setState({ loading: true });
    await axios.get(logoutUrl);
  }

  disableModal() {
    this.setState({ modalMessage: "" });
  }

  render() {
    const { loading, modalMessage } = this.state;
    return (
      <View style={{ height: "100%", width: "100%" }}>
        <View style={{ display: "flex", alignItems: "flex-end", padding: 10 }}>
          <Button
            title="Sair"
            type="clear"
            color="#005f8f"
            onPress={() => this.onLoggoutHandle()}
          />
        </View>
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
          <Text>Ola</Text>
          <Button loading={loading} title="clique" />
        </View>
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
  }
});

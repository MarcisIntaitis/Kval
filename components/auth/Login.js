import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";
import firebase from "firebase/compat/app";


export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
    this.onSignIn = this.onSignIn.bind(this);
  }

  // Logs the output of the response from the api 
  onSignIn() {
    const { email, password } = this.state;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((results) => {
        console.log(results)
    })
    .catch((err) => {
        console.log(err)
    })
  }

  // Sign in form
  render() {
    return (
      <View>
        <TextInput
          placeholder="email"
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
        />

        <Button onPress={() => this.onSignIn()} title="Login" />
      </View>
    );
  }
}

export default Login;

import React, { Component } from "react";
import { View, Button, TextInput } from "react-native";
import firebase from "firebase/compat/app";
export class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      name: "",
    };
    this.onSignUp = this.onSignUp.bind(this);
  }

  // Logs the output of the response from the api
  onSignUp() {
    const { email, password, name } = this.state;
    firebase.auth().createUserWithEmailAndPassword(email, password)

      .then((results) => {
        firebase.firestore().collection("users")
          .doc(firebase.auth().currentUser.uid)
          .set({
            name,
            email,
          });
        console.log(results);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Registration form
  render() {
    return (
      <View>
        <TextInput
          placeholder="name"
          onChangeText={(name) => this.setState({ name })}
        />
        <TextInput
          placeholder="email"
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
        />

        <Button onPress={() => this.onSignUp()} title="Sign Up" />
      </View>
    );
  }
}

export default Register;

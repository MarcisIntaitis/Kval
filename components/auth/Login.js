import firebase from "firebase/compat/app";
import React, { Component } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

export class Login extends Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			password: "",
		};
		this.onSignIn = this.onSignIn.bind(this);
	}

	// Logs the output of the response from the api
	onSignIn() {
		const { email, password } = this.state;
		firebase
			.auth()
			.signInWithEmailAndPassword(email, password)
			.then((results) => {
				console.log(results);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	// Sign in form
	render() {
		return (
			<View style={styles.login}>
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

const styles = StyleSheet.create({});

export default Login;

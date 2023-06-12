import firebase from "firebase/compat/app";
import React, { Component } from "react";
import {
	TouchableOpacity,
	StyleSheet,
	TextInput,
	View,
	Text,
} from "react-native";

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
			<View style={styles.container}>
				<View style={styles.loginContainer}>
					<Text style={styles.loginText}> Log in </Text>
					<TextInput
						style={styles.inputContainer}
						placeholder="email"
						onChangeText={(email) => this.setState({ email })}
					/>
					<TextInput
						style={styles.inputContainer}
						placeholder="password"
						secureTextEntry={true}
						onChangeText={(password) => this.setState({ password })}
					/>

					<TouchableOpacity
						onPress={() => this.onSignIn()}
						style={styles.buttonStyle}
					>
						<Text>Login</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#333",
	},
	loginContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		maxWidth: 600,
		backgroundColor: "#424242",
	},
	loginContainerText: {
		flex: 0.1,
		justifyContent: "flex-end",
		alignItems: "baseline",
		width: "100%",
		maxWidth: 400,
	},
	loginText: {
		color: "#CFCFCF",
		fontSize: 48,
		fontWeight: "bold",
		paddingBottom: 15,
	},
	buttonStyle: {
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		width: 200,
		marginVertical: 4,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	inputContainer: {
		marginHorizontal: 10,
		width: "100%",
		maxWidth: 300,
		height: 40,
		backgroundColor: "#D9D9D9",
		borderRadius: 20,
		paddingLeft: 10,
		marginVertical: 4,
	},
});

export default Login;

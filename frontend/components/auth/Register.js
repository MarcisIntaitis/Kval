import React, { Component } from "react";
import {
	View,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Text,
} from "react-native";
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
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)

			.then((results) => {
				firebase
					.firestore()
					.collection("users")
					.doc(firebase.auth().currentUser.uid)
					.set({
						name,
						email,
						role: "user",
						bio: "",
						profilePic: "",
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
			<View style={styles.container}>
				<View style={styles.registerContainer}>
					<View style={styles.registerContainerText}>
						<Text style={styles.registerText}>Sign up</Text>
					</View>
					<TextInput
						placeholder="name"
						onChangeText={(name) => this.setState({ name })}
						style={styles.inputContainer}
					/>
					<TextInput
						placeholder="email"
						onChangeText={(email) => this.setState({ email })}
						style={styles.inputContainer}
					/>
					<TextInput
						placeholder="password"
						secureTextEntry={true}
						onChangeText={(password) => this.setState({ password })}
						style={styles.inputContainer}
					/>

					<TouchableOpacity
						onPress={() => this.onSignUp()}
						style={styles.buttonStyle}
					>
						<Text>Register</Text>
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
	registerContainer: {
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		width: "100%",
		maxWidth: 600,
		backgroundColor: "#424242",
	},
	registerContainerText: {
		flex: 0.1,
		justifyContent: "flex-end",
		alignItems: "baseline",
		width: "100%",
		maxWidth: 400,
	},
	registerText: {
		color: "#CFCFCF",
		fontSize: 48,
		fontWeight: "bold",
		paddingBottom: 10,
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
		width: "100%",
		maxWidth: 400,
		height: 50,
		backgroundColor: "#D9D9D9",
		borderRadius: 20,
		paddingLeft: 10,
		marginVertical: 4,
	},
});

export default Register;

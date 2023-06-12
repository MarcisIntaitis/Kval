import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

export default function Landing({ navigation }) {
	return (
		<View style={styles.container}>
			<View style={styles.landingContainer}>
				<Text style={styles.landingText}> MESA </Text>
				<TouchableOpacity
					style={styles.buttonStyle}
					onPress={() => navigation.navigate("Login")}
				>
					<Text>Login</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.buttonStyle}
					onPress={() => navigation.navigate("Register")}
				>
					<Text>Register</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#333",
	},
	landingContainer: {
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		width: "100%",
		maxWidth: 600,
		backgroundColor: "#424242",
	},
	landingText: {
		color: "#CFCFCF",
		fontSize: 48,
		fontWeight: "bold",
		paddingBottom: 15,
	},
	buttonStyle: {
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		width: 400,
		marginVertical: 4,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
});

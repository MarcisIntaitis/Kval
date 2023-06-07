import React, { useState } from "react";
import {
	View,
	TextInput,
	Image,
	Text,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

import firebase from "firebase/compat/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/compat/storage";

export default function Save(props) {
	const [caption, setCaption] = useState("");

	//uploads the image to storage under the folder which has the user id as the name, each post gets saved with a string consisting of one of 26 character or a number 0-9
	const uploadImage = async () => {
		const childPath = `post/${
			firebase.auth().currentUser.uid
		}/${Math.random().toString(36)}`;
		props.navigation.popToTop();

		const uri = props.route.params.image;
		const response = await fetch(uri);
		const blob = await response.blob();

		const task = firebase.storage().ref().child(childPath).put(blob);

		const taskProgress = (snapshot) => {
			console.log(`transferred: ${snapshot.bytesTransferred}`);
		};

		const taskCompleted = () => {
			task.snapshot.ref.getDownloadURL().then(async (snapshot) => {
				savePostData(snapshot);
			});
		};

		const taskError = (snapshot) => {
			console.log(snapshot);
		};

		task.on("state_changed", taskProgress, taskError, taskCompleted);
	};

	//saves the created post to the database so its easier to fetch the image url and display it as a post later on
	const savePostData = (downloadURL) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(firebase.auth().currentUser.uid)
			.collection("userPosts")
			.add({
				downloadURL,
				caption,
				creation: firebase.firestore.FieldValue.serverTimestamp(),
			});
	};

	return (
		<View style={styles.container}>
			<View style={styles.saveScreenContainer}>
				<View style={styles.imageContainer}>
					<Image
						style={styles.image}
						source={{ uri: props.route.params.image }}
					/>
				</View>
				<TextInput
					placeholder="Caption"
					onChangeText={(caption) => setCaption(caption)}
					style={styles.textInput}
				/>
				<TouchableOpacity onPress={() => uploadImage()} style={styles.button}>
					<Text> Save Image</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#333",
	},
	saveScreenContainer: {
		marginTop: 20,
		flex: 1,
		maxWidth: 650,
		width: "100%",
		borderRadius: 12,
		backgroundColor: "#424242",
	},
	image: {
		maxWidth: 500,
		maxHeight: 500,
		flex: 1,
		aspectRatio: 1,
	},
	imageContainer: {
		paddingTop: 20,
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
	},
	textInput: {
		maxWidth: 500,
		width: "100%",
		marginTop: 20,
		marginBottom: 10,
		height: 40,
		paddingHorizontal: 12,
		alignSelf: "center",
		backgroundColor: "grey",
		borderRadius: 20,
	},
	button: {
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginVertical: 5,
		width: 300,
		borderRadius: 20,
		alignItems: "center",
		alignSelf: "center",
	},
});

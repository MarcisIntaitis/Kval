import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";

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

		const uri = props.route.params.image;
		const response = await fetch(uri);
		const blob = await response.blob();

		const task = firebase.storage().ref().child(childPath).put(blob);

		const taskProgress = (snapshot) => {
			console.log(`transferred: ${snapshot.bytesTransferred}`);
		};

		const taskCompleted = () => {
			task.snapshot.ref.getDownloadURL().then((snapshot) => {
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
			})
			.then(() => {
				props.navigation.popToTop();
			});
	};

	return (
		<View style={{ flex: 1 }}>
			<Image source={{ uri: props.route.params.image }} />
			<TextInput
				placeholder="Caption"
				onChangeText={(caption) => setCaption(caption)}
			/>
			<Button title="Save image" onPress={() => uploadImage()} />
		</View>
	);
}

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Dimensions,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "./ChatMessage";

function ChatRoom(props) {
	const dummy = useRef();
	const messagesRef = firebase.firestore().collection("messages");
	const query = messagesRef.orderBy("createdAt");

	const [messages] = useCollectionData(query, { idField: "id" });
	const [users, setUsers] = useState({});
	const [userProfilePics, setUserProfilePics] = useState({}); // State variable to store user profile pictures
	const [formValue, setFormValue] = useState("");

	useEffect(() => {
		// Fetch user data from Firebase
		firebase
			.firestore()
			.collection("users")
			.get()
			.then((snapshot) => {
				const userData = {};
				const profilePics = {}; // Temporary object to store profile pictures
				snapshot.forEach((doc) => {
					const data = doc.data();
					userData[doc.id] = data;
					profilePics[doc.id] = data.profilePic;
				});
				setUsers(userData);
				setUserProfilePics(profilePics); // Store the profile pictures
			})
			.catch((error) => {
				console.log("Error fetching user data:", error);
			});
	}, []);

	const sendMessage = async () => {
		if (formValue.trim()) {
			const { uid, photoURL } = firebase.auth().currentUser;
			const messageId = uuidv4();

			await messagesRef.doc(messageId).set({
				id: messageId,
				text: formValue,
				createdAt: serverTimestamp(),
				uid,
				photoURL,
			});

			setFormValue("");
			dummy.current?.scrollToEnd({ animated: true });
		}
	};

	const handleKeyPress = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			sendMessage();
		}
	};

	const getDisplayName = useCallback(
		(uid) => {
			return users[uid]?.name || "";
		},
		[users]
	);

	const getProfilePic = useCallback(
		(uid) => {
			return userProfilePics[uid] || "";
		},
		[userProfilePics]
	);

	return (
		<View style={styles.container}>
			<View style={styles.messagingContainer}>
				<ScrollView
					ref={dummy}
					onContentSizeChange={() =>
						dummy.current?.scrollToEnd({ animated: true })
					}
					style={styles.scrollViewContent}
				>
					{messages &&
						messages.map((message) => (
							<ChatMessage
								key={message.id}
								message={message}
								displayName={getDisplayName(message.uid)}
								photoURL={getProfilePic(message.uid)}
							/>
						))}
				</ScrollView>

				<View style={styles.inputContainer}>
					<TextInput
						value={formValue}
						onChangeText={setFormValue}
						onSubmitEditing={sendMessage}
						onKeyPress={handleKeyPress}
						placeholder="Type your message"
						style={styles.input}
					/>

					<TouchableOpacity onPress={sendMessage} style={styles.buttonStyle}>
						<Text style={styles.buttonText}>Send</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#333",
		alignItems: "center",
	},
	messagingContainer: {
		flex: 1,
		width: "100%",
		maxWidth: 900,
		backgroundColor: "#424242",
	},
	scrollViewContent: {
		paddingHorizontal: 16,
	},
	buttonText: {
		color: "#333",
		fontWeight: "400",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#424242",
	},
	input: {
		flex: 1,
		height: 40,
		paddingHorizontal: 12,
		backgroundColor: "grey",
		borderRadius: 20,
		marginRight: 10,
	},
	buttonStyle: {
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		width: 80,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default ChatRoom;

import React, { useRef, useState, useEffect } from "react";
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

const windowWidth = Dimensions.get("window").width;

function ChatRoom(props) {
	const dummy = useRef();
	const messagesRef = firebase.firestore().collection("messages");
	const query = messagesRef.orderBy("createdAt");

	const [messages] = useCollectionData(query, { idField: "id" });
	const [users, setUsers] = useState({}); // State variable to store user data

	useEffect(() => {
		// Fetch user data from Firebase
		firebase
			.firestore()
			.collection("users")
			.get()
			.then((snapshot) => {
				const userData = {};
				snapshot.forEach((doc) => {
					userData[doc.id] = doc.data();
				});
				setUsers(userData);
			})
			.catch((error) => {
				console.log("Error fetching user data:", error);
			});
	}, []);

	const [formValue, setFormValue] = useState("");

	const sendMessage = async () => {
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
	};

	const handleKeyPress = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			if (formValue.trim()) {
				sendMessage();
			}
		}
	};

	const getDisplayName = (uid) => {
		return users[uid]?.name || ""; // Get name from user data
	};

	const getProfilePic = (uid) => {
		return users[uid]?.profilePic || "";
	};

	return (
		<View style={styles.container}>
			<View style={styles.messagingContainer}>
				<ScrollView
					contentContainerStyle={styles.scrollViewContent}
					ref={dummy}
					onContentSizeChange={() =>
						dummy.current?.scrollToEnd({ animated: true })
					}
				>
					{messages &&
						messages.map((msg) => (
							<ChatMessage
								key={msg.id}
								message={msg}
								displayName={getDisplayName(msg.uid)}
								photoURL={getProfilePic(msg.uid)}
							/>
						))}
				</ScrollView>

				<View style={styles.inputContainer}>
					<TextInput
						value={formValue}
						onChangeText={(text) => setFormValue(text)}
						placeholder="Say something nice"
						style={styles.input}
						onKeyPress={handleKeyPress}
					/>

					<TouchableOpacity
						style={styles.buttonStyle}
						disabled={!formValue}
						onPress={sendMessage}
					>
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
		paddingVertical: 10,
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

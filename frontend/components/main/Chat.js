import React, { useRef, useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	ScrollView,
	Image,
	StyleSheet,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const Chat = () => {
	return <ChatRoom />;
};

function ChatRoom() {
	const dummy = useRef();
	const messagesRef = firebase.firestore().collection("messages");
	const query = messagesRef.orderBy("createdAt").limit(25);

	const [messages] = useCollectionData(query, { idField: "id" });

	const [formValue, setFormValue] = useState("");

	const sendMessage = async () => {
		const { uid, photoURL } = firebase.auth().currentUser;
		const messageId = uuidv4(); // Generate a unique ID for the message

		await messagesRef.doc(messageId).set({
			id: messageId, // Assign the unique ID to the "id" field
			text: formValue,
			createdAt: serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue("");
		dummy.current.scrollToEnd({ animated: true });
	};

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollViewContent}
				ref={dummy}
				onContentSizeChange={() =>
					dummy.current.scrollToEnd({ animated: true })
				}
			>
				{messages &&
					messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
			</ScrollView>

			<View style={styles.inputContainer}>
				<TextInput
					value={formValue}
					onChangeText={(text) => setFormValue(text)}
					placeholder="Say something nice"
					style={styles.input}
				/>

				<Button title="Send" disabled={!formValue} onPress={sendMessage} />
			</View>
		</View>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass =
		uid === firebase.auth().currentUser.uid ? "sent" : "received";

	return (
		<View
			style={[
				styles.messageContainer,
				messageClass === "sent" && styles.sentMessageContainer,
			]}
		>
			<Image
				source={{
					uri:
						photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png",
				}}
				style={styles.avatar}
			/>

			<View
				style={[
					styles.messageBubble,
					messageClass === "sent" && styles.sentMessageBubble,
				]}
			>
				<Text
					style={[
						styles.messageText,
						messageClass === "sent" && styles.sentMessageText,
					]}
				>
					{text}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollViewContent: {
		paddingVertical: 20,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	input: {
		flex: 1,
		paddingHorizontal: 10,
		height: 40,
		borderWidth: 1,
	},
	messageContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 5,
		marginHorizontal: 10,
	},
	sentMessageContainer: {
		justifyContent: "flex-end",
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	messageBubble: {
		backgroundColor: "green",
		padding: 10,
		borderRadius: 8,
	},
	sentMessageBubble: {
		backgroundColor: "blue",
		alignSelf: "flex-end",
	},
	messageText: {
		color: "white",
	},
	sentMessageText: {
		textAlign: "right",
	},
});

export default Chat;

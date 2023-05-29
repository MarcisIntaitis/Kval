import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	Dimensions,
	Platform,
	TouchableOpacity,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const windowWidth = Dimensions.get("window").width;

const ChatMessage = React.memo(function ChatMessage(props) {
	const { text, uid, createdAt } = props.message;
	const { displayName, photoURL } = props;
	const [roles, setRoles] = useState("");
	const currentUserUID = firebase.auth().currentUser.uid;

	const [isDropdownVisible, setIsDropdownVisible] = useState(false);
	const fetchRoleData = async () => {
		const userRoleSnapshot = await firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser.uid)
			.get();
		const roleData = userRoleSnapshot.data();
		if (roleData) {
			setRoles(roleData.role);
		}
	};
	fetchRoleData();

	const messageClass = uid === currentUserUID ? "sent" : "received";

	const messageTime = createdAt
		? createdAt.toDate().toLocaleTimeString([], {
				hour: "numeric",
				minute: "numeric",
		  })
		: "";

	const messageBubbleStyle = [
		styles.messageBubble,
		messageClass === "sent" && styles.sentMessageBubble,
		{
			maxWidth: (2 / 3) * (windowWidth > 900 ? 900 : windowWidth) - 30,
			backgroundColor:
				messageClass === "sent" ? "#87CEEB" : getRandomColor(uid),
		},
	];

	const messageTextStyle = [
		styles.messageText,
		messageClass === "sent" && styles.sentMessageText,
		Platform.OS === "web" ? styles.messageTextWeb : styles.messageTextMobile,
		{
			maxWidth: (2 / 3) * windowWidth,
		},
	];

	const handleToggleDropdown = async () => {
		setIsDropdownVisible((prevState) => !prevState);
	};

	const handleHideDropdown = () => {
		setIsDropdownVisible(false);
	};

	const handleDeleteMessage = (id) => {
		firebase.firestore().collection("messages").doc(id).delete();
		setIsDropdownVisible(false);
	};

	const handleReplyMessage = () => {
		// Set the replied message in the ChatRoom component
		props.setReplyMessage({
			id: props.message.id,
			text: props.message.text,
			displayName: props.displayName, // Pass the displayName of the user being replied to
		});

		// Implement any additional UI changes for the reply functionality if needed

		setIsDropdownVisible(false);
	};

	return (
		<View
			style={[
				styles.messageContainer,
				messageClass === "sent" && styles.sentMessageContainer,
			]}
		>
			{messageClass === "received" && (
				<Image source={{ uri: photoURL }} style={styles.avatar} />
			)}
			<TouchableOpacity
				onLongPress={handleToggleDropdown}
				onPress={handleHideDropdown}
				style={styles.dropdownButton}
			>
				<View style={messageBubbleStyle}>
					{props.message.replyTo && (
						<View style={styles.replyMessageContainer}>
							<Text style={styles.replyMessageCreator}>
								Replying to: {props.message.replyTo.displayName}
							</Text>
							<Text style={styles.replyMessageText}>
								{props.message.replyTo.text}
							</Text>
						</View>
					)}
					<View style={styles.messageHeader}>
						<Text style={styles.messageUsername}>{displayName}</Text>
					</View>
					<Text style={messageTextStyle}>{text}</Text>
					<Text style={styles.messageTime}>{messageTime}</Text>
				</View>
			</TouchableOpacity>
			{isDropdownVisible && (
				<View style={styles.dropdownContainerStyle}>
					<View style={styles.dropdownBox}>
						{currentUserUID === props.message.uid || roles === "admin" ? (
							<TouchableOpacity
								onPress={() => handleDeleteMessage(props.message.id)}
								style={styles.dropdownOption}
							>
								<Text style={styles.dropdownOptionText}>Delete</Text>
							</TouchableOpacity>
						) : null}
						<TouchableOpacity
							onPress={() => handleReplyMessage(props.message.id)}
							style={styles.dropdownOption}
						>
							<Text style={styles.dropdownOptionText}>Reply</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
});

const getRandomColor = (uid) => {
	const hash = Array.from(uid).reduce(
		(acc, char) => (acc << 5) - acc + char.charCodeAt(0),
		0
	);
	const color = "#" + (hash & 0xffffff).toString(16).padStart(6, "0");
	const minBrightness = 0.8;

	const rgbToHsl = (r, g, b) => {
		[r, g, b] = [r, g, b].map((c) => c / 255);

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;
		const l = (max + min) / 2;

		if (max === min) {
			return [0, 0, l];
		} else {
			let h;
			const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}

			h /= 6;
			return [h, s, l];
		}
	};

	const hslColor = rgbToHsl(
		parseInt(color.slice(1, 3), 16),
		parseInt(color.slice(3, 5), 16),
		parseInt(color.slice(5, 7), 16)
	);

	if (hslColor[2] < minBrightness) {
		hslColor[2] = minBrightness;
	}

	const hslToRgb = (h, s, l) => {
		let r, g, b;

		if (s === 0) {
			r = g = b = l;
		} else {
			const hue2rgb = (p, q, t) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		const toHex = (c) =>
			Math.round(c * 255)
				.toString(16)
				.padStart(2, "0");

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	return hslToRgb(...hslColor);
};

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	sentMessageContainer: {
		flexDirection: "row-reverse",
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		marginRight: 8,
	},
	messageBubble: {
		borderRadius: 16,
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	sentMessageBubble: {
		backgroundColor: "#87CEEB",
	},
	messageHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	messageUsername: {
		fontWeight: "bold",
		marginRight: 4,
	},
	messageText: {
		fontSize: 16,
	},
	sentMessageText: {
		color: "#000",
	},
	messageTextWeb: {
		lineHeight: 24,
	},
	messageTextMobile: {
		lineHeight: 20,
	},
	messageTime: {
		fontSize: 12,
		color: "#777",
	},
	dropdownButton: {
		margin: 0,
	},
	dropdownBox: {
		backgroundColor: "#FFF",
		borderRadius: 8,
		marginHorizontal: 5,
		padding: 8,
		elevation: 4,
	},
	dropdownOption: {
		paddingVertical: 4,
	},
	dropdownOptionText: {
		fontSize: 16,
	},
	replyMessageContainer: {
		flex: 1,
		flexDirection: "column",
		backgroundColor: "#bae0de",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginBottom: 6,
	},
	replyMessageCreator: {
		fontSize: 14,
		color: "#000",
		fontStyle: "italic",
		fontWeight: "bold",
	},
	replyMessageText: {
		fontSize: 12,
		color: "#000",
		fontStyle: "italic",
	},
});

export default ChatMessage;

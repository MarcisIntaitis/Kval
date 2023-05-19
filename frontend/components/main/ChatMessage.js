import React, { useRef, useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	Dimensions,
	Platform,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const windowWidth = Dimensions.get("window").width;

function ChatMessage(props) {
	const { text, uid, photoURL, createdAt } = props.message;
	const displayName = props.displayName;

	const currentUserUID = firebase.auth().currentUser.uid;

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

	return (
		<View
			style={[
				styles.messageContainer,
				messageClass === "sent" && styles.sentMessageContainer,
			]}
		>
			{messageClass === "received" && (
				<Image
					source={{
						uri:
							photoURL ||
							"https://1fid.com/wp-content/uploads/2022/07/funny-profile-pic-5-520x520.jpg",
					}}
					style={styles.avatar}
				/>
			)}

			<View style={messageBubbleStyle}>
				<Text style={styles.messageUsername}>{displayName}</Text>
				<Text style={messageTextStyle}>{text}</Text>
				<Text style={styles.messageTime}>{messageTime}</Text>
			</View>
		</View>
	);
}

const getRandomColor = (uid) => {
	// Generate a random color based on the user ID
	const hash = uid.split("").reduce((acc, char) => {
		acc = (acc << 5) - acc + char.charCodeAt(0);
		return acc & acc;
	}, 0);

	const color = "#" + ((hash >> 0) & 0xffffff).toString(16).padStart(6, "0");

	const minBrightness = 0.7; // Minimum brightness value (adjust as needed)

	// Convert color to HSL
	const rgbToHsl = (r, g, b) => {
		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h,
			s,
			l = (max + min) / 2;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

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
		}

		return [h, s, l];
	};

	const hslColor = rgbToHsl(
		parseInt(color.substr(1, 2), 16),
		parseInt(color.substr(3, 2), 16),
		parseInt(color.substr(5, 2), 16)
	);

	// Adjust brightness if below the minimum value
	if (hslColor[2] < minBrightness) {
		hslColor[2] = minBrightness;
	}

	// Convert HSL back to RGB
	const hslToRgb = (h, s, l) => {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
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

		const toHex = (c) => {
			const hex = Math.round(c * 255).toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		};

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	};

	const adjustedColor = hslToRgb(hslColor[0], hslColor[1], hslColor[2]);

	return adjustedColor;
};

const styles = StyleSheet.create({
	messageContainer: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginVertical: 6,
	},
	sentMessageContainer: {
		flexDirection: "row-reverse",
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
		backgroundColor: "black",
	},
	messageBubble: {
		backgroundColor: "#9ade7c",
		padding: 10,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 2,
	},
	sentMessageBubble: {
		backgroundColor: "#87CEEB",
	},
	messageUsername: {
		marginBottom: 4,
		fontWeight: "bold",
		color: "#333",
	},
	messageText: {
		fontSize: 16,
		color: "#333",
	},
	sentMessageText: {
		color: "black",
	},
	messageTextWeb: {
		marginTop: -6,
		marginBottom: 5,
	},
	messageTextMobile: {
		marginTop: -20,
		paddingTop: 15,
	},
	messageTime: {
		fontSize: 12,
		marginBottom: -4,
		color: "black",
		alignSelf: "flex-end",
	},
});

export default ChatMessage;

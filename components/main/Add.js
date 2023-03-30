import { Camera } from "expo-camera";
import { useState, useEffect } from "react";
import { StyleSheet, Text, Button, View } from "react-native";

export default function App() {
	const [hasPermission, setHasPermission] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.Back);

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		})();
	}, []);

	if (hasPermission === null) {
		return <View />;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.camContainer}>
				<Camera style={styles.fixedRatio} type={type} ratio={"1:1"} />
			</View>
			<Button
				title="Flip Camera"
				onPress={() => {
					setType(
						type === Camera.Constants.Type.backgroundColor
							? Camera.Constants.Type.front
							: Camera.Constants.Type.back
					);
				}}
			></Button>
		</View>
	);
}

const styles = StyleSheet.create({
	camContainer: {
		flex: 1,
		flexDirection: "row",
	},
	fixedRatio: {
		flex: 1,
		aspectRatio: 1,
	},
});

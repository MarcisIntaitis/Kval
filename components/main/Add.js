import { Camera } from "expo-camera";
import { useState, useEffect } from "react";
import { StyleSheet, Text, Button, View, Image } from "react-native";

export default function App() {
	const [hasPermission, setHasPermission] = useState(null);
	const [camera, setCamera] = useState(null);
	const [image, setImage] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.Back);

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		})();
	}, []);

	const takePicture = async () => {
		if (camera) {
			const data = await camera.takePictureAsync(null);
			setImage(data.uri);
		}
	};

	if (hasPermission === null) {
		return <View />;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.camContainer}>
				<Camera
					style={styles.fixedRatio}
					type={type}
					ratio={"1:1"}
					ref={(ref) => setCamera(ref)}
				/>
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
			<Button title="Take Picture" onPress={() => takePicture()}></Button>
			{image && <Image source={{ uri: image }} style={{ flex: 1 }} />}
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

import { Camera } from "expo-camera";
import { useState, useEffect } from "react";
import { StyleSheet, Text, Button, View, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Add({ navigation }) {
	const [hasCameraPermission, setHasCameraPermission] = useState(null);
	const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
	const [camera, setCamera] = useState(null);
	const [image, setImage] = useState(null);
	const [type, setType] = useState(Camera.Constants.Type.Back);

	useEffect(() => {
		(async () => {
			const cameraStatus = await Camera.requestCameraPermissionsAsync();
			setHasCameraPermission(cameraStatus.status === "granted");

			const galleryStatus =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			setHasGalleryPermission(galleryStatus.status === "granted");
		})();
	}, []);

	const takePicture = async () => {
		if (camera) {
			const data = await camera.takePictureAsync(null);
			setImage(data.uri);
		}
	};

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		console.log(result);

		if (!result.cancelled) {
			setImage(result.uri);
		}
	};

	if (hasCameraPermission === null || hasGalleryPermission === false) {
		return <View />;
	}
	if (hasCameraPermission === false || hasGalleryPermission === false) {
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
			<Button title="Pick from gallery" onPress={() => pickImage()}></Button>
			<Button
				title="Save"
				onPress={() => navigation.navigate("Save", { image })}
			></Button>
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

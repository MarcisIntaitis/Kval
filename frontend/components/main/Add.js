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
	const [isImageSelected, setIsImageSelected] = useState(false);

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
			setIsImageSelected(true);
		}
	};

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.cancelled) {
			setImage(result.uri);
			setIsImageSelected(true);
		}
	};

	const handleSave = () => {
		if (image) {
			navigation.navigate("Save", { image });
		}
	};

	const handleBack = () => {
		setIsImageSelected(false);
	};

	if (hasCameraPermission === null || hasGalleryPermission === false) {
		return <View />;
	}

	if (hasCameraPermission === false || hasGalleryPermission === false) {
		return (
			<View style={styles.container}>
				{image && <Image source={{ uri: image }} style={styles.image} />}
				{isImageSelected ? (
					<>
						<Button title="Save" onPress={handleSave} style={styles.button} />
						<Button title="Back" onPress={handleBack} style={styles.button} />
					</>
				) : (
					<>
						<Button
							title="Pick from gallery"
							onPress={() => pickImage()}
							style={styles.button}
						/>
						<Button
							title="Save"
							onPress={handleSave}
							style={styles.button}
							disabled
						/>
						<Button
							title="Back"
							onPress={handleBack}
							style={styles.button}
							disabled
						/>
					</>
				)}
			</View>
		);
	}

	return (
		<>
			{!isImageSelected && (
				<View style={styles.container}>
					<View style={styles.addContainer}>
						<View style={styles.camContainer}>
							<Camera
								style={styles.camera}
								type={type}
								ref={(ref) => setCamera(ref)}
							/>
						</View>
						<Button
							title="Flip Camera"
							onPress={() =>
								setType(
									type === Camera.Constants.Type.Back
										? Camera.Constants.Type.Front
										: Camera.Constants.Type.Back
								)
							}
							style={styles.button}
						/>
						<Button
							title="Take Picture"
							onPress={() => takePicture()}
							style={styles.button}
						/>
						<Button
							title="Pick from gallery"
							onPress={() => pickImage()}
							style={styles.button}
						/>
					</View>
				</View>
			)}
			{isImageSelected && (
				<View style={styles.container}>
					<View style={styles.addContainer}>
						<View style={styles.camContainer}>
							{image && <Image source={{ uri: image }} style={styles.camera} />}
						</View>
						<Button title="Save" onPress={handleSave} style={styles.button} />
						<Button title="Back" onPress={handleBack} style={styles.button} />
					</View>
				</View>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#333",
	},

	savedImageContainer: {},
	addContainer: {
		marginTop: 20,
		flex: 1,
		maxWidth: 650,
		width: "100%",
		borderRadius: 12,
		backgroundColor: "#424242",
	},
	camContainer: {
		paddingTop: 20,
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
	},
	camera: {
		maxWidth: 500,
		maxHeight: 500,
		flex: 1,
		aspectRatio: 1,
	},
	button: {
		marginVertical: 10,
		width: 200,
	},
});

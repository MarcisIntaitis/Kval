import { Camera } from "expo-camera";
import { useState, useEffect } from "react";
import { StyleSheet, Text, Button, View, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Add({ navigation }) {
	const [hasCameraPermission, setHasCameraPermission] = useState(null);
	const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
	const [camera, setCamera] = useState(null);
	const [image, setImage] = useState(null);
	const [isImageSelected, setIsImageSelected] = useState(false);
	const [type, setType] = useState(Camera.Constants.Type.Back);
	const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
	const refresh = () => window.location.reload(true);

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
								type={cameraType}
								ref={(ref) => setCamera(ref)}
							/>
						</View>
						<TouchableOpacity
							onPress={() =>
								setCameraType(
									cameraType === Camera.Constants.Type.back
										? Camera.Constants.Type.front
										: Camera.Constants.Type.back
								)
							}
							style={styles.button}
						>
							<Text>Flip Camera</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => takePicture()}
							style={styles.button}
						>
							<Text>Take Picture</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => pickImage()} style={styles.button}>
							<Text>Pick from gallery</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			{isImageSelected && (
				<View style={styles.container}>
					<View style={styles.addContainer}>
						<View style={styles.camContainer}>
							{image && <Image source={{ uri: image }} style={styles.camera} />}
						</View>
						<TouchableOpacity onPress={handleSave} style={styles.button}>
							<Text>Save</Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={handleBack} style={styles.button}>
							<Text>Back</Text>
						</TouchableOpacity>
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
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginVertical: 5,
		width: 300,
		borderRadius: 20,
		alignItems: "center",
		alignSelf: "center",
	},
});

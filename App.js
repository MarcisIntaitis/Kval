import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import LandingScreen from "./frontend/components/auth/Landing";
import LoginScreen from "./frontend/components/auth/Login";
import RegisterScreen from "./frontend/components/auth/Register";
import MainScreen from "./frontend/components/Main";
import AddScreen from "./frontend/components/main/Add";
import rootReducer from "./frontend/redux/reducers";
import SaveScreen from "./frontend/components/main/Save";
import CommentScreen from "./frontend/components/main/Comment";
import FullscreenPictureScreen from "./frontend/components/main/FullscreenPicture";
import ChatScreen from "./frontend/components/main/Chat";
import config from "./config.json";

const store = createStore(rootReducer, applyMiddleware(thunk));

// Firebase config info for connecting to the API and ensuring Firebase works
const firebaseConfig = {
	apiKey: config.API_KEY,
	authDomain: config.AUTH_DOMAIN,
	projectId: config.PROJECT_ID,
	storageBucket: config.STORAGE_BUCKET,
	messagingSenderId: config.MESSAGING_SENDER_ID,
	appId: config.APP_ID,
	measurementId: config.MEASUREMENT_ID,
};

if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();

const App = () => {
	const [loggedIn, setLoggedIn] = useState(false);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				setLoggedIn(false);
				setLoaded(true);
			} else {
				setLoggedIn(true);
				setLoaded(true);
			}
		});
	}, []);

	if (!loaded) {
		return (
			<View style={{ flex: 1, justifyContent: "center" }}>
				<Text>Loading</Text>
			</View>
		);
	}

	return (
		<Provider store={store}>
			<NavigationContainer>
				<Stack.Navigator
					initialRouteName={loggedIn ? "Main" : "Landing"}
					screenOptions={{
						headerTintColor: "#FFF", // Set the header text color to white
						headerStyle: {
							height: 60,
							backgroundColor: "#424242", // Set the header background color
						},
						headerShadowVisible: false,
					}}
				>
					{!loggedIn ? (
						<>
							<Stack.Screen
								name="Landing"
								component={LandingScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="Register"
								component={RegisterScreen}
								options={{ headerTitle: "Register" }} // Set the header title
							/>
							<Stack.Screen
								name="Login"
								component={LoginScreen}
								options={{ headerTitle: "Login" }} // Set the header title
							/>
						</>
					) : (
						<>
							<Stack.Screen
								name="Main"
								component={MainScreen}
								options={{ headerTitle: "App name" }} // Set the header title
							/>
							<Stack.Screen
								name="Add"
								component={AddScreen}
								options={{ headerTitle: "Add" }} // Set the header title
							/>
							<Stack.Screen
								name="Save"
								component={SaveScreen}
								options={{ headerTitle: "Save" }} // Set the header title
							/>
							<Stack.Screen
								name="Comment"
								component={CommentScreen}
								options={{ headerTitle: "Comments" }} // Set the header title
							/>
							<Stack.Screen
								name="Post"
								component={FullscreenPictureScreen}
								options={{ headerTitle: "Post" }} // Set the header title
							/>
							<Stack.Screen
								name="Chat"
								component={ChatScreen}
								options={{ headerShown: false }}
							/>
						</>
					)}
				</Stack.Navigator>
			</NavigationContainer>
		</Provider>
	);
};

export default App;

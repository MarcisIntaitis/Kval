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

import {
	API_KEY,
	AUTH_DOMAIN,
	PROJECT_ID,
	STORAGE_BUCKET,
	MESSAGING_SENDER_ID,
	APP_ID,
	MEASUREMENT_ID,
} from "./config";

const store = createStore(rootReducer, applyMiddleware(thunk));

// Firebase config info for connecting to the API and ensuring Firebase works
const firebaseConfig = {
	apiKey: API_KEY,
	authDomain: AUTH_DOMAIN,
	projectId: PROJECT_ID,
	storageBucket: STORAGE_BUCKET,
	messagingSenderId: MESSAGING_SENDER_ID,
	appId: APP_ID,
	measurementId: MEASUREMENT_ID,
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
				<Stack.Navigator initialRouteName={loggedIn ? "Main" : "Landing"}>
					{!loggedIn ? (
						<>
							<Stack.Screen
								name="Landing"
								component={LandingScreen}
								options={{ headerShown: false }}
							/>
							<Stack.Screen name="Register" component={RegisterScreen} />
							<Stack.Screen name="Login" component={LoginScreen} />
						</>
					) : (
						<>
							<Stack.Screen
								name="Main"
								component={MainScreen}
								options={{ headerShown: true }}
							/>
							<Stack.Screen
								name="Add"
								component={AddScreen}
								options={{ headerShown: true }}
							/>
							<Stack.Screen name="Save" component={SaveScreen} />
							<Stack.Screen name="Comment" component={CommentScreen} />
							<Stack.Screen name="Post" component={FullscreenPictureScreen} />
							<Stack.Screen
								name="Chat"
								component={ChatScreen}
								options={{ headerShown: true }}
							/>
						</>
					)}
				</Stack.Navigator>
			</NavigationContainer>
		</Provider>
	);
};

export default App;

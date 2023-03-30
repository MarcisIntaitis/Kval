import firebase from "firebase/compat/app";
import { USER_STATE_CHANGE } from "../constants/index";

//makes a call to firestore and checks if snapshot exists if it does then its able to get the data from the database
export function fetchUser() {
	return (dispatch) => {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser.uid)
			.get()
			.then((snapshot) => {
				if (snapshot.exists) {
					dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
				} else {
					console.log("doesnt exist");
				}
				return snapshot.data(); // add this line to return the snapshot data
			});
	};
}

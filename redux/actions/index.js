import firebase from "firebase/compat/app";
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE } from "../constants/index";

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

//makes the same call as the previous function but to posts and gets all of the posts in ascending order

export function fetchUserPosts() {
	return (dispatch) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(firebase.auth().currentUser.uid)
			.collection("userPosts")
			.orderBy("creation", "desc")
			.get()
			.then((snapshot) => {
				let posts = snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return {
						id,
						...data,
					};
				});
				dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
			});
	};
}

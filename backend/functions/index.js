/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.addLike = functions.firestore
    .document("/posts/{creatorId}/userPosts/{postId}/likes/{userId}")
    .onCreate((snap, context) => {
      return db
          .collection("posts")
          .doc(context.params.creatorId)
          .collection("userPosts")
          .doc(context.params.postId)
          .update({
            likesCount: admin.firestore.FieldValue.increment(1),
          });
    });

exports.removeLike = functions.firestore
    .document("/posts/{creatorId}/userPosts/{postId}/likes/{userId}")
    .onDelete((snap, context) => {
      return db
          .collection("posts")
          .doc(context.params.creatorId)
          .collection("userPosts")
          .doc(context.params.postId)
          .update({
            likesCount: admin.firestore.FieldValue.increment(-1),
          });
    });

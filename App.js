import React, { useState } from 'react';
import { Button, Image, View, Text, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import { storage } from './firebase'; // Import your Firebase configuration

export default function ImagePickerExample() {
 const [image, setImage] = useState(null);
 const [isImagePicked, setIsImagePicked] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const [inferenceResults, setInferenceResults] = useState(null);
 const [firebaseImageUrl, setFirebaseImageUrl] = useState(null); // State to store Firebase image URL

 const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsImagePicked(true);

      // Call function to upload image to Firebase Storage
      uploadImageToFirebase(result.assets[0].uri);
    }
 };

 const uploadImageToFirebase = async (imageUri) => {
   setIsUploading(true); // Set uploading state to true
   try {
     const response = await fetch(imageUri);
     const blob = await response.blob();
     const storageRef = ref(storage, 'images/' + Date.now()); // Generate a unique filename using the current timestamp
     const uploadTask = uploadBytesResumable(storageRef, blob);

     uploadTask.on('state_changed',
       (snapshot) => {
         // Progress updates here (optional)
       },
       (error) => {
         console.error('Error uploading image:', error);
         setIsUploading(false); // Reset uploading state to false
       },
       () => {
         // Upload completed successfully, now we can get the download URL
         getDownloadURL(uploadTask.snapshot.ref)
           .then((downloadURL) => {
             // Store the Firebase image URL in state
             setFirebaseImageUrl(downloadURL);
             setIsUploading(false); // Reset uploading state to false
           })
           .catch((error) => {
             console.error('Error getting download URL:', error);
             setIsUploading(false); // Reset uploading state to false
           });
       }
     );
   } catch (error) {
     console.error('Error uploading image:', error);
     setIsUploading(false); // Reset uploading state to false
   }
 };

 const handleButtonPress = async () => {
   if (isImagePicked && !isUploading) {
     // If image is selected and not currently uploading, send inference request
     sendInferenceRequest();
   } else if (!isImagePicked && !isUploading) {
     // If image is not selected and not currently uploading, pick an image
     pickImage();
   }
 };

 const sendInferenceRequest = async () => {
   // Check if Firebase image URL is available
   if (firebaseImageUrl) {
     const endpointUrl = "https://yolo-endpoint.westus.inference.ml.azure.com/score";
     const apiKey = "";
   
     const headers = {
       'Content-Type': 'application/json',
       'Authorization': ('Bearer ' + apiKey),
     };
   
     const requestData = {
       "image_urls": [firebaseImageUrl], // Use Firebase image URL for inference
     };
   
     try {
       const response = await axios.post(endpointUrl, requestData, { headers });
       // Attempt to parse the response data as JSON
       const parsedData = JSON.parse(response.data);
       // If parsing is successful, set the parsed data as inferenceResults
       setInferenceResults(parsedData);
     } catch (error) {
       console.error("Error sending inference request or parsing response:", error);
       // Optionally, handle the error or set a default value for inferenceResults
     }
   } else {
     console.error("Firebase image URL not available.");
   }
 };

 const displayResults = () => {
    if (inferenceResults && Array.isArray(inferenceResults)) {
       return inferenceResults.map((result, index) => (
         <View key={index} style={{ marginBottom: 20 }}>
           <Text>Mango ID: {result["Mango ID"]}</Text>
           <Text>Total Damage Area: {result["Total Damage Area"]}</Text>
           <Text>Mango Area: {result["Mango Area"]}</Text>
           <Text>Severity Level: {result["Severity Level"]}</Text>
           <Text>Severity Level Category: {result["Severity Level Category"]}</Text>
           {result["image_copy"] && (
             <Image
               source={{ uri: `data:image/png;base64,${result["image_copy"]}` }}
               style={{ width: 200, height: 200 }}
             />
           )}
         </View>
       ));
    }
    return null;
   };

 return (
   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
     {/* Display selected image */}
     {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
     {/* Button to pick image or send image for inference */}
     <Button
       title={isUploading ? "Uploading Image..." : isImagePicked ? "Diagnose" : "Pick an image from camera roll"}
       onPress={handleButtonPress}
       disabled={isUploading}
     />
     {/* Display inference results */}
     {displayResults()}
   </View>
 );
}

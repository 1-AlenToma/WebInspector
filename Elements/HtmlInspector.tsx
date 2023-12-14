import * as React from "react";
import {
  useState,
  useEffect,
  useRef
} from "react";
import {
  TextInput,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  button,
  TouchableOpacity
} from "react-native";
import { Zocial } from '@expo/vector-icons'; 
import gdata from "../gData";
import methods from "../methods"
import IDOMParser from 'advanced-html-parser';
import WebView from "react-native-webview";
import { Asset,useAssets } from 'expo-asset';
import single from "../assets/single"
let s = single;
    s+= "\n"+ `
       if(!window.inspectorloaded){
       window.renderInspector();
       window.inspectorloaded = true;
       }
      `
const onLoadInjected = `
    if (document.readyState !== 'loading') {
    window.ReactNativeWebView.postMessage('InjectNewCode');
} else {
    document.addEventListener('DOMContentLoaded', function () {
        window.ReactNativeWebView.postMessage('InjectNewCode');
    });
}
  `;
export default ()=> {
   const r= useRef()
   const [text,setText] = useState("");
   const [search,setSearch] =
   useState(`https://www.google.com/search?q=&oq=&sourceid=chrome-mobile&ie=UTF-8`);
  const onSubmit = ()=>{
    let google = `https://www.google.com/search?q=${text}&oq=${text}&sourceid=chrome-mobile&ie=UTF-8`+ text;
    if(methods.isValidUrl(text) != "")
        google = text;
    setSearch(google);
  }
  
  const injectCode=()=>{
    r.current?.injectJavaScript(s);
  }
  
  return (<>
     <View style={{height:80,width:"100%",justifyContent:"flex-start",
     display:"flex",alignItems:"flex-end",backgroundColor:"#2A272A",
     flexDirection:"row"}}>
     <TextInput placeholder="Search or type web address"
     onSubmitEditing={onSubmit}
      style={styles.input} value={text} onChangeText={setText} />
      <TouchableOpacity onPress={injectCode}>
      <Zocial style={styles.icon} name="html5" size={24} color="#fff" />
      </TouchableOpacity>
     </View>
    <WebView
    ref={r}
    onLoad={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setText(nativeEvent.url)
  }}
    onMessage={ ({ nativeEvent }) => {
        if (nativeEvent.data === 'InjectNewCode') {
            injectCode()
        }
      }}
    style={{width:gdata.windowSize.width,
    height:gdata.windowSize.height,position:"relative", top:0}}
    javaScriptEnabled={true}
    source={{ uri: search}}
    />
    </>
  )
}

const styles = StyleSheet.create({
  txt:{
    textAlign:"left",
    minWidth:"100%"
  }, 
  icon:{
    width:30,
    height:30,
    position:"relative",
    top:-10
  },
  input: {
    borderWidth: 1,
    padding: 2,
    paddingLeft:10,
    width:"90%",
    borderRadius:5,
    backgroundColor:"gray",
    color:"white",
    marginBottom:10,
    marginLeft:10,
    borderColor:"#4B4A54"
  },
  loading:{
    position:"absolute",
    top:"45%"
  }
})
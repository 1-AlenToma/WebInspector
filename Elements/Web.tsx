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
import { Zocial, AntDesign, FontAwesome } from '@expo/vector-icons';
import gdata from "../gData";
import methods from "../Methods"
import WebView from "react-native-webview";
import { Asset, useAssets } from 'expo-asset';
import single from "../assets/single";
let LoadingIndicatorView = ()=> {
return (
<ActivityIndicator
	color="#009b88"
	size="large"
	style={{
	flex: 1,
	justifyContent: 'center',
	position: "absolute",
	top: "45%",
	left: "45%"
	}}
	/>
);
}
const lib = `
window.debugMode=true;
setTimeout(()=>{
if(!window.renderInspector){
${single};
}
},100)
true;
`;
export type RefItem = {
url?:string,
back?: Function,
forward?:Function,
onScroll?: (value:number) => void;
}
export default ({refItem,width,height,onLoad}:{refItem:RefItem,width:number,height:number,onLoad:Funtion})=> {
	const r = useRef()
	const [emEnabled, setEmEnabled] = useState(false)
	const [text, setText] = useState("");
	const [search, setSearch] =
	useState(`https://www.google.com/search?q=&oq=&sourceid=chrome-mobile&ie=UTF-8`);
	const [icon, setIcon] = useState({uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${search}`})
	const onSubmit = ()=>{
	let google = `https://www.google.com/search?q=${text}&oq=${text}&sourceid=chrome-mobile&ie=UTF-8`+ text;
	if (methods.isValidUrl(text))
	google = text;
	setSearch(google);
	}

	
	refItem.url = search;
	refItem.back = ()=> r.current?.goBack();
	refItem.forward = ()=> r.current?.goForward()
	useEffect(()=> {
	injectCode();
	}, [emEnabled])
	useEffect(()=>{
		refItem.icon= icon.uri;
		refItem?.onchange(refItem);
	onLoad();
	}, [icon])


	const injectCode = ()=>{
	r.current?.injectJavaScript(emEnabled ? `window.renderInspector();
	true;`: `window.clearEmulator();
	true;`);
	}

	const messageHandler = async (data:any)=>{
	let json = JSON.parse(data);
	if (json.type == "download"){
	methods.writeFile(json.data).then(()=> alert("file downloaded")).catch(e=> alert(e))
	}
	}

	return (<View style={[{
		zIndex: 5,
		width: width,
		height: height,
		maxHeight: height,
		overflow: "hidden"
		}]}>
  <View style={[styles.tabBar, {
			width: width
			}]}>
			<FontAwesome style={styles.remove} onPress={()=> refItem.remove(refItem.id)} name="remove" size={20} color="red" />
     <TextInput
				selectTextOnFocus={true}
				keyboardType="url"
				disableFullscreenUI={true}
				placeholder="Search or type web address"
				onSubmitEditing={onSubmit}
				style={styles.input} value={text}
				onChangeText={setText} />
      <TouchableOpacity onPress={()=>setEmEnabled(!emEnabled)}>
      <Zocial style={styles.icon} name="html5" size={24} color={emEnabled ?"red": "#ffffff"} />
      </TouchableOpacity>
     </View>
  <WebView
			ref={r}
			onLoad={(syntheticEvent) => {
			const { nativeEvent } = syntheticEvent;
			setIcon({uri: `https://s2.googleusercontent.com/s2/favicons?domain_url=${nativeEvent.url}`})
			setText(nativeEvent.url)
			}}
			style={[{
			width: width,
			height: height -80
			}]}
			onMessage={(event) => {
			messageHandler(event.nativeEvent.data);
			}}
			renderLoading={LoadingIndicatorView}
			startInLoadingState={true}
			onLoadEnd={injectCode()}
			onOpenWindow={(syntheticEvent) => {
			const { nativeEvent } = syntheticEvent;
			const { targetUrl } = nativeEvent
			setSearch(targetUrl)
			}}
			injectedJavaScriptBeforeContentLoadedForMainFrameOnly={true}
			injectedJavaScriptBeforeContentLoaded={lib}
			javaScriptEnabled={true}
			domStorageEnabled={true}
			mixedContentMode="always"
			allowsFullscreenVideo={true}
			allowFileAccessFromFileURLs={true}
			allowUniversalAccessFromFileURLs={true}
			allowingReadAccessToURL={true}
			cacheEnabled={true}
			allowsLinkPreview={true}
			originWhitelist={['*']}
			allowsBackForwardNavigationGestures={true}
			source={{ uri: search}}

			/>
		</View>
	)
	}

	const styles = StyleSheet.create({
	txt: {
	textAlign: "left",
	minWidth: "100%"
	},
	tabBar: {
	height: 50,
	width: "100%",
	justifyContent: "center",
	display: "flex",
	alignItems: "flex-end",
	backgroundColor: "#2A272A",
	flexDirection: "row",
	overflow: "hidden"
	},

	icon: {
	width: 30,
	height: 30,
	position: "relative",
	top: -10
	},
	remove: {
	position: "relative",
	left: 10,
	top: -15
	},
	input: {
	borderWidth: 1,
	padding: 2,
	paddingLeft: 10,
	width: "85%",
	borderRadius: 5,
	backgroundColor: "gray",
	color: "white",
	marginBottom: 10,
	marginLeft: "5%",
	borderColor: "#4B4A54"
	},
	loading: {
	position: "absolute",
	top: "45%"
	}
	})
import {Animated } from "react-native";
import {useState, useEffect, useRef} from "react";
import gdata from "../gData"

export default ({children,style,refItem}:any)=> {
	const [size, setSize] = useState({});
	const [animWidth, setAnimWidth] = useState();
	const [animHeight, setAnimHeight] = useState();
	let animated = useRef(false);
	let init = useRef(false);

	let toggle = (show)=> {
	if (show === animated.current)
	return;
	animated.current = show;
	init.current = true;
	if (typeof refItem.width === "number" && animWidth)
	Animated.timing(animWidth, {
	toValue: !show ? size.width: refItem.width,
	duration: 200,
	useNativeDriver: false,
	}).start();

	if (typeof refItem.height === "number" && animHeight)
	Animated.timing(animHeight, {
	toValue: !show ? size.height: refItem.height,
	duration: 200,
	useNativeDriver: false,
	}).start();
	}

	refItem.show = ()=> toggle(true);
	refItem.hide = ()=> toggle(false);
	gdata.subscribe(()=>{
	setAnimWidth(null);
	setAnimHeight(null);
	}, "screen")

	return (
	<Animated.View style={[style, {
		...(typeof refItem.height === "number" && animHeight ? {height: animHeight}: {}),
		...(typeof refItem.width === "number" && animWidth ? {width: animWidth}: {})
		}]} onLayout={(event) => {
		const {x, y, width, height} = event.nativeEvent.layout;
		if (!animHeight || !init.current){
		setAnimWidth(new Animated.Value(width));
		setAnimHeight(new Animated.Value(height));
		setSize(event.nativeEvent.layout);
		}
		}}>
		{children}
		</Animated.View>
	)
	}
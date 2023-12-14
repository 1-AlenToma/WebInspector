import {useState, useEffect} from "react";
import {Image} from "react-native";

export default ({source,style}:{source:any,style:any})=> {
	const [s, setS] = useState(source);
	useEffect(()=>{
	setS(source)
	}, [source])


	return (
	<Image source={s} style={style} />
	)
	}
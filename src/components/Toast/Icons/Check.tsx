import React from "react";
const Check = React.forwardRef<
	SVGSVGElement,
	{ height?: number; width?: number; fillColor?: string }
>((props, ref) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "20"}
			height={props.height || "20"}
			viewBox="0 0 20 20"
			fill="none">
			<circle cx="10" cy="10" r="10" fill="var(--success-500)"></circle>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M8.47691 12.1335L14.1385 6L15 6.93326L8.47691 14L5 10.2333L5.86146 9.30006L8.47691 12.1335Z"
				fill={props.fillColor || "var(--base-1200)"}></path>
		</svg>
	);
});

export default Check;

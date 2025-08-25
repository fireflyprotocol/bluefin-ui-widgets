import React from "react";
const Close = React.forwardRef<
	SVGSVGElement,
	{ height: number; width: number; fillColor: string }
>((props, ref) => {
	return (
		<svg
			ref={ref}
			width={props.height}
			height={props.width}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0)">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M11.7279 10.7272L17.4555 4.99964L18.7283 6.27243L13.0007 12L18.7283 17.7276L17.4555 19.0004L11.7279 13.2728L6.00036 19.0004L4.72756 17.7276L10.4551 12L4.72756 6.27244L6.00036 4.99964L11.7279 10.7272Z"
					fill={props.fillColor}
				/>
			</g>
			<defs>
				<clipPath id="clip0">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
});

export default Close;

import React from "react";
const Warning = React.forwardRef<
	SVGSVGElement,
	{ height?: number; width?: number; fillColor?: string; className?: string }
>(({ width, height, fillColor, ...rest }, ref) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width || "20"}
			height={height || "20"}
			viewBox="0 0 20 20"
			fill="none">
			<circle cx="10" cy="10" r="10" fill="var(--destructive-200)" />
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.93333 12.1335L13.0666 6L13.9999 6.93326L6.93333 14L6 13.0667L6.93333 12.1335Z"
				fill={fillColor || "var(--base-1200)"}
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M13.0667 12.1335L6.93336 6L6.00013 6.93326L13.0667 14L14 13.0667L13.0667 12.1335Z"
				fill={fillColor || "var(--base-1200)"}
			/>
		</svg>
	);
});

export default Warning;

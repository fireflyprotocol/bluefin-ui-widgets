import React from "react";
const Loading = React.forwardRef<
	SVGSVGElement,
	{ fillColor?: string; height?: number; width?: number; className?: string }
>(({ width = 20, height = 20, fillColor = "var(--base-700)", className = "spin", ...rest }, ref) => {
	return (


<svg className={className} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="none">
<path d="M10.0013 18.3334C14.5188 18.3334 18.3346 14.5176 18.3346 10.0001H16.668C16.668 13.6142 13.6155 16.6667 10.0013 16.6667C6.38714 16.6667 3.33464 13.6142 3.33464 10.0001C3.33464 6.38675 6.38714 3.33341 10.0013 3.33341V1.66675C5.4838 1.66675 1.66797 5.48341 1.66797 10.0001C1.66797 14.5176 5.4838 18.3334 10.0013 18.3334Z" fill={fillColor}/>
</svg>
);
});

export default Loading;

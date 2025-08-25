import React from "react";


interface IRenderIfProps {
	condition: boolean;
	render: JSX.Element;
}

export function RenderIf(props: IRenderIfProps): JSX.Element {
	const { condition = false, render } = props;

	return condition ? render : <></>;
}

interface IRenderIfElseProps {
	condition: boolean;
	render: JSX.Element;
	elseRender: JSX.Element;
}

export function RenderIfElse(props: IRenderIfElseProps): JSX.Element {
	const { condition = false, render, elseRender } = props;

	return condition ? render : elseRender;
}





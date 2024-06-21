//import toast from "react-hot-toast";

import toast from "react-hot-toast";
import Toast from "components/Toast/Toast";
import React from "react";



function makeToast(
	title: string,
	message: string,
	type: "error" | "success" | "loading" | "info" = "info",
	duration: number = 3000,
	position:
		| "top-center"
		| "top-left"
		| "top-right"
		| "bottom-center"
		| "bottom-left"
		| "bottom-right" = "bottom-right"
) {
	let defaultClasses = "starship-notification have-close have-left-icon medium ";
	defaultClasses =
		type === "error"
			? `${defaultClasses} error`
			: type === "success"
			? `${defaultClasses} success`
			: type === "loading"
			? `${defaultClasses} process`
			: defaultClasses;

	return toast(
		(t) => (
			<Toast
				title={title}
				message={message}
				type={type}
				dismiss={toast.dismiss}
				id={t.id}
			/>
		),
		{ duration, className: defaultClasses, position }
	);
}




export const NotificationService = {
	makeToast,
};

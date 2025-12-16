import { memo } from "react";

import ReactLoadingSkeleton, {
	SkeletonProps,
	SkeletonTheme,
} from "react-loading-skeleton";

import StorageService from "utils/storage.service";

import styles from "./Skeleton.module.scss";

import "react-loading-skeleton/dist/skeleton.css";
import React from "react";

const Skeleton = (props: SkeletonProps & { theme?: "light-theme" | "dark-theme" }) => {
	const appTheme =
		StorageService.getItemByKey("theme") === "light-theme"
			? "light-theme"
			: "dark-theme";
	const themeColors = {
		"light-theme": {
			base: "#ebebeb",
			highlight: "#f5f5f5",
		},
		"dark-theme": {
			base: "#22232b",
			highlight: "#303142",
		},
	};

	const selectedTheme = themeColors[appTheme || "dark-theme"];

	return (
		<SkeletonTheme
			baseColor={selectedTheme.base}
			highlightColor={selectedTheme.highlight}>
			<ReactLoadingSkeleton containerClassName={styles.skeleton} {...props} />
		</SkeletonTheme>
	);
};

export default memo(Skeleton);
